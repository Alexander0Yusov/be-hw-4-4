import { Injectable } from '@nestjs/common';
import { UserInputDto } from '../dto/user/user-input.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/user/user.entity';
import type { UserModelType } from '../domain/user/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from '../dto/user/create-user-domain.dto';
import { EmailService } from '../../mailer/email.service';
import { addDays } from 'date-fns';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersService {
  constructor(
    //инжектирование модели в сервис через DI
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async createUser(dto: UserInputDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.UserModel.createInstance({
      email: dto.email,
      login: dto.login,
      passwordHash: passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async update(id: string, dto: UpdateUserDto): Promise<string> {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    user.update(dto);

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string) {
    const user = await this.usersRepository.findOrNotFoundFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }

  //
  async registerUser(dto: UserInputDto): Promise<void> {
    const existsLogin = await this.usersRepository.findByEmailOrLogin(
      dto.login,
    );

    if (existsLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Login is already exists',
        extensions: [{ message: 'Login is already exists', field: 'login' }],
      });
    }

    const existsEmail = await this.usersRepository.findByEmailOrLogin(
      dto.email,
    );

    if (existsEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is already exists',
        extensions: [{ message: 'Email is already exists', field: 'email' }],
      });
    }

    const createdUserId = await this.createUser(dto);

    const user = await this.usersRepository.findOrNotFoundFail(createdUserId);

    const confirmCode = uuidv4() as string;
    const expirationDate = addDays(new Date(), 2);

    user.setEmailConfirmationCode(confirmCode, expirationDate);

    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationEmail(user.email, confirmCode)
      .catch(console.error); // ???
  }
}
