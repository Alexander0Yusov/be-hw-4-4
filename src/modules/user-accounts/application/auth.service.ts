import { Inject, Injectable } from '@nestjs/common';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from './crupto.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';
import { EmailService } from '../../../modules/mailer/email.service';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from '../constants/auth-tokens.inject-constants';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private cryptoService: CryptoService,
    private emailService: EmailService,

    @Inject(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
    private accessTokenContext: JwtService,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,
  ) {}

  async validateUser(
    login: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user = await this.usersRepository.findByEmailOrLogin(login);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.cryptoService.comparePasswords({
      password,
      hash: user.passwordHash,
    });

    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id.toString() };
  }

  async login(userId: string) {
    // const accessToken = this.jwtService.sign({ id: userId } as UserContextDto, {
    //   expiresIn: '5m',
    // });

    const accessToken = this.accessTokenContext.sign({
      id: userId,
    });

    const refreshToken = this.refreshTokenContext.sign({
      id: userId,
      deviceId: 'deviceId',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async sendRecoveryPasswordCode(email: string): Promise<void> {
    const user = await this.usersRepository.findByEmailOrNotFoundFail(email);

    const newConfirmCode = uuidv4() as string;
    const newExpirationDate = addDays(new Date(), 2);

    user.setPasswordConfirmationCode(newConfirmCode, newExpirationDate);

    await this.usersRepository.save(user);

    this.emailService
      .sendRecoveryEmail(user.email, newConfirmCode)
      .catch(console.error); // ???
  }

  async newPasswordApplying(
    newPassword: string,
    recoveryCode: string,
  ): Promise<void> {
    const user =
      await this.usersRepository.findByPasswordRecoveryCodeOrNotFoundFail(
        recoveryCode,
      );

    if (
      user.passwordRecovery.expirationDate &&
      user.passwordRecovery.expirationDate < new Date() &&
      user.passwordRecovery.isConfirmed === false
    ) {
      const hasdedPassword =
        await this.cryptoService.createPasswordHash(newPassword);
      user.setNewPassword(hasdedPassword);
      await this.usersRepository.save(user);
    } else {
      // error
    }
  }

  async confirmEmail(code: string): Promise<void> {
    const user =
      await this.usersRepository.findByEmailRecoveryCodeOrNotFoundFail(code);

    if (
      user.emailConfirmation.expirationDate &&
      user.emailConfirmation.expirationDate > new Date() &&
      user.emailConfirmation.isConfirmed === false
    ) {
      user.setEmailIsConfirmed();
      await this.usersRepository.save(user);
    } else {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Code is already used',
        extensions: [{ field: 'code', message: 'Code is already used' }],
      });
    }
  }

  async resendEmailConfirmationCode(email: string): Promise<void> {
    let user;
    try {
      user = await this.usersRepository.findByEmailOrNotFoundFail(email);
    } catch (error) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email not found',
        extensions: [{ field: 'email', message: 'Email not found' }],
      });
    }

    if (user.emailConfirmation.isConfirmed === false) {
      const newCode = uuidv4();
      const newExpDate = addDays(new Date(), 2);

      user.setEmailConfirmationCode(newCode, newExpDate);

      await this.usersRepository.save(user);

      this.emailService
        .sendConfirmationEmail(user.email, newCode)
        .catch(console.error); // ???
    } else {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is already confirmed',
        extensions: [{ field: 'email', message: 'Email is already confirmed' }],
      });
    }
  }
}
