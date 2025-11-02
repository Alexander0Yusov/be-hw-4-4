import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { REFRESH_TOKEN_STRATEGY_INJECT_TOKEN } from 'src/modules/user-accounts/constants/auth-tokens.inject-constants';
import {
  Session,
  type SessionModelType,
} from 'src/modules/user-accounts/domain/session/session.entity';
import { CreateSessionDomainDto } from 'src/modules/user-accounts/dto/session/create-session-domain.dto';
import { JwtRefreshPayload } from 'src/modules/user-accounts/dto/session/jwt-refresh-payload.dto';
import { SessionInputDto } from 'src/modules/user-accounts/dto/session/session-input.dto';
import { SessionsRepository } from 'src/modules/user-accounts/infrastructure/sessions.repository';

export class CreateSessionCommand {
  constructor(public dto: SessionInputDto) {}
}

@CommandHandler(CreateSessionCommand)
export class CreateSessionUseCase
  implements ICommandHandler<CreateSessionCommand, void>
{
  constructor(
    @InjectModel(Session.name)
    private SessionModel: SessionModelType,

    @Inject(REFRESH_TOKEN_STRATEGY_INJECT_TOKEN)
    private refreshTokenContext: JwtService,

    private sessionsRepository: SessionsRepository,
  ) {}

  async execute({ dto }: CreateSessionCommand): Promise<void> {
    const { id, deviceId, iat, exp } = (await this.refreshTokenContext.decode(
      dto.refreshToken,
    )) as unknown as JwtRefreshPayload;

    const newSession: CreateSessionDomainDto = {
      deviceId: deviceId,
      userId: new Types.ObjectId(id),
      ip: dto.ip,
      deviceName: dto.deviceName,
      expiresAt: new Date(exp * 1000),
      lastActiveDate: new Date(iat * 1000),
      isRevoked: false,
    };

    const session = this.SessionModel.createInstance(newSession);
    await this.sessionsRepository.save(session);
  }
}
