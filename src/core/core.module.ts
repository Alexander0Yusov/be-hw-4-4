import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreConfig } from './core.config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Global()
@Module({
  imports: [
    CqrsModule,
    // ThrottlerModule.forRoot({
    //   throttlers: [
    //     {
    //       name: 'default',
    //       ttl: 10_000,
    //       limit: 5,
    //     },
    //   ],
    // }),
  ],

  providers: [
    CoreConfig,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],

  exports: [
    CqrsModule,
    CoreConfig,
    // ThrottlerModule
  ],
})
export class CoreModule {}
