import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import {
  Session,
  SessionDocument,
  type SessionModelType,
} from '../domain/session/session.entity';
import { Types } from 'mongoose';

@Injectable()
export class SessionsRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}

  async save(session: SessionDocument) {
    await session.save();
  }

  async findOrNotFoundFail(
    userId: string,
    deviceId: string,
  ): Promise<SessionDocument> {
    const session = await this.SessionModel.findOne({
      userId: new Types.ObjectId(userId),
      deviceId,
    });

    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }

    return session;
  }

  async findByDeviceIdOrNotFoundFail(
    deviceId: string,
  ): Promise<SessionDocument> {
    const session = await this.SessionModel.findOne({
      deviceId,
    });

    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }

    return session;
  }

  async deleteManyExceptCurrent(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    await this.SessionModel.deleteMany({
      userId: new Types.ObjectId(userId),
      deviceId: { $ne: deviceId },
    });
  }

  async deleteByDeviceIdAndUserId(
    userId: string,
    deviceId: string,
  ): Promise<void> {
    const result = await this.SessionModel.deleteOne({
      userId: new Types.ObjectId(userId),
      deviceId,
    });

    if (result.deletedCount === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Session not found',
      });
    }
  }
}
