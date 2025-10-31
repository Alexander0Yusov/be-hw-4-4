// важно configModule импортировать первым
import { configModule } from './config-dynamic-module';

import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingModule } from './modules/testing/testing.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { CoreModule } from './core/core.module';
import { CoreConfig } from './core/core.config';

// nest g module modules/user-accounts
// nest g controller modules/user-accounts --no-spec
// nest g service modules/user-accounts --no-spec

@Module({
  imports: [
    // MongooseModule.forRoot(
    //   'mongodb+srv://admin:admin@incubator.ueu5c87.mongodb.net/?retryWrites=true&w=majority&appName=incubator',
    // ),
    MongooseModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        const uri = coreConfig.mongoURI;
        console.log('DB_URI', uri);

        return {
          uri: uri,
        };
      },
      inject: [CoreConfig],
    }),

    BloggersPlatformModule,
    UserAccountsModule,
    NotificationsModule,
    MailerModule,
    CoreModule,
    configModule,

    // выполнена реализация по альтернативному пути через static async forRoot()
    //...(process.env.INCLUDE_TESTING_MODULE ? [TestingModule] : []),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    // такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
    // чтобы не обращаться в декораторе к переменной окружения через process.env в декораторе, потому что
    // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS

    return {
      module: AppModule,
      imports: [...(coreConfig.includeTestingModule ? [TestingModule] : [])], // Add dynamic modules here
    };
  }
}
