import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Session,
  type SessionModelType,
} from '../../domain/session/session.entity';
import { SessionViewDto } from '../../dto/session/session-view.dto';
import { Types } from 'mongoose';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectModel(Session.name) private SessionModel: SessionModelType,
  ) {}

  async findManyForCurrentUser(userId: string): Promise<SessionViewDto[]> {
    const items = await this.SessionModel.find({
      userId: new Types.ObjectId(userId),
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    })
      .sort({ lastActiveDate: -1 })
      .lean();

    return items.map((item) => ({
      ip: item.ip,
      title: item.deviceName,
      lastActiveDate: item.lastActiveDate.toISOString(),
      deviceId: item.deviceId,
    }));
  }
}
