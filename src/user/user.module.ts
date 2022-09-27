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
import { CampaignSchema } from './schemas/campaign.schema';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';

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
      {
        name: 'Campaign',
        schema: CampaignSchema,
      },
    ]),
  ],
  controllers: [UserController, AppConfigController, CampaignController],
  providers: [UserService, AppConfigService, CampaignService],
  exports: [UserService, AppConfigService],
})
export class UserModule {}
