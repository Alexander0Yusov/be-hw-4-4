import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { configValidationUtility } from 'src/setup/config-validation.utility';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

// each module has it's own *.config.ts

@Injectable()
export class CoreConfig {
  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 3000',
    },
  )
  port: number;

  @IsNotEmpty({
    message:
      'Set Env variable MONGO_URI, example: mongodb://localhost:27017/my-app-local-db',
  })
  mongoURI: string;

  @IsEnum(Environments, {
    message:
      'Ser correct NODE_ENV value, available values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: string;

  //...

  @IsNotEmpty({
    message: 'Set Env variable REFRESH_TOKEN_SECRET, dangerous for security!',
  })
  refreshTokenSecret: string;

  @IsNotEmpty({
    message: 'Set Env variable ACCESS_TOKEN_SECRET, dangerous for security!',
  })
  accessTokenSecret: string;

  @IsBoolean({
    message:
      'Set Env variable INCLUDE_TESTING_MODULE, dangerous for app lifecycle!',
  })
  includeTestingModule: boolean;

  constructor(private configService: ConfigService<any, true>) {
    this.port = Number(this.configService.get('PORT'));
    this.mongoURI = this.configService.get('MONGO_URI');
    this.env = this.configService.get('NODE_ENV');
    this.refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');
    this.accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');
    this.includeTestingModule = Boolean(
      this.configService.get('INCLUDE_TESTING_MODULE'),
    );

    configValidationUtility.validateConfig(this);
  }
}
