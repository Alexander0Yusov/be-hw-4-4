import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingModule } from './modules/testing/testing.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { CoreModule } from './core/core.module';

// nest g module modules/user-accounts
// nest g controller modules/user-accounts --no-spec
// nest g service modules/user-accounts --no-spec

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://admin:admin@incubator.ueu5c87.mongodb.net/?retryWrites=true&w=majority&appName=incubator',
    ),
    TestingModule,
    BloggersPlatformModule,
    UserAccountsModule,
    NotificationsModule,
    MailerModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
