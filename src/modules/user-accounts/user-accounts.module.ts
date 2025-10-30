import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { AuthController } from './api/auth.controller';
import { SecurityDevicesController } from './api/security-devices.controller';
import { AuthService } from './application/auth.service';
import { SecurityDevicesService } from './application/security-devices.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './domain/user/user.entity';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersQueryRepository } from './infrastructure/query/users-query.repository';
import { NotificationsModule } from '../notifications/notifications.module';
import { CryptoService } from './application/crupto.service';
import { LocalStrategy } from './guards/local/local.strategy';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthQueryRepository } from './infrastructure/query/auth-query.repository';
import { BasicStrategy } from './guards/basic/basic.strategy';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    NotificationsModule,
    // JwtModule.register({
    //   secret: 'access-token-secret', //TODO: move to env. will be in the following lessons
    //   signOptions: { expiresIn: '5m' }, // Время жизни токена
    // }),

    JwtModule,
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    //
    AuthService,
    AuthQueryRepository,
    //
    CryptoService,
    //
    BasicStrategy,
    LocalStrategy,
    JwtStrategy,
    //
    SecurityDevicesService,
    //
    //пример инстанцирования через токен
    //если надо внедрить несколько раз один и тот же класс
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: 'access-token-secret', //TODO: move to env. will be in the following lessons
          signOptions: { expiresIn: '5m' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (): JwtService => {
        return new JwtService({
          secret: 'refresh-token-secret', //TODO: move to env. will be in the following lessons
          signOptions: { expiresIn: '24h' },
        });
      },
      inject: [
        /*TODO: inject configService. will be in the following lessons*/
      ],
    },
  ],
  exports: [UsersQueryRepository],
})
export class UserAccountsModule {}
