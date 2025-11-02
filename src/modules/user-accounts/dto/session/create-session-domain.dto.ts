import { Types } from 'mongoose';

export class CreateSessionDomainDto {
  deviceId: string;
  userId: Types.ObjectId;
  ip: string;
  deviceName: string;
  expiresAt: Date;
  lastActiveDate: Date;
  isRevoked: boolean;
}
