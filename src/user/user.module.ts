import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { AppConfigController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from './schemas/user.schema';
import { AuthCodeSchema } from './schemas/authCode.schema';
import { HttpModule } from '@nestjs/axios';
import { AppConfigService } from './appConfig.service';
import { AppConfigSchema } from './schemas/appConfig.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
      {
        name: 'AuthCode',
        schema: AuthCodeSchema,
      },
      {
        name: 'AppConfig',
        schema: AppConfigSchema,
      },
    ]),
  ],
  controllers: [UserController, AppConfigController],
  providers: [UserService, AppConfigService],
  exports: [UserService, AppConfigService],
})
export class UserModule {}
