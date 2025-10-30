import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from '../domain/user/user.entity';
import type { UserModelType } from '../domain/user/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async save(user: UserDocument) {
    await user.save();
  }

  async findOrNotFoundFail(id: string): Promise<UserDocument> {
    const user = await this.UserModel.findById(id);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return user;
  }

  async findByEmailOrNotFoundFail(email: string): Promise<UserDocument> {
    const user = await this.UserModel.findOne({ email });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return user;
  }

  async findByPasswordRecoveryCodeOrNotFoundFail(
    code: string,
  ): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      'passwordRecovery.confirmationCode': code,
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return user;
  }

  async findByEmailRecoveryCodeOrNotFoundFail(
    code: string,
  ): Promise<UserDocument> {
    const user = await this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Code not found',
        extensions: [{ message: 'Code not found', field: 'code' }],
      });
    }

    return user;
  }

  findByLogin(login: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ login });
  }

  async findByEmailOrLogin(loginOrEmail: string): Promise<UserDocument | null> {
    const user = await this.UserModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });

    if (user) {
      return user;
    }

    return null;
  }
}
