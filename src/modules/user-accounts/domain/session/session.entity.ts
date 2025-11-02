import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateSessionDomainDto } from '../../dto/session/create-session-domain.dto';

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: String, required: true, unique: true })
  deviceId: string;

  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  deviceName: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Date, required: true })
  lastActiveDate: Date;

  @Prop({ type: Boolean, required: true, default: false })
  isRevoked: boolean;

  updatedAt: Date;

  static createInstance(dto: CreateSessionDomainDto): SessionDocument {
    const session = new this();

    session.deviceId = dto.deviceId;
    session.userId = dto.userId;
    session.ip = dto.ip;
    session.deviceName = dto.deviceName;
    session.expiresAt = dto.expiresAt;
    session.lastActiveDate = dto.lastActiveDate;
    session.isRevoked = dto.isRevoked;

    return session as SessionDocument;
  }

  updateExpAndIatTimes(exp: Date, iat: Date) {
    this.expiresAt = exp;
    this.lastActiveDate = iat;
  }

  revoking() {
    this.isRevoked = true;
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);

//регистрирует методы сущности в схеме
SessionSchema.loadClass(Session);

//Типизация документа
export type SessionDocument = HydratedDocument<Session>;

//Типизация модели + статические методы
export type SessionModelType = Model<SessionDocument> & typeof Session;
