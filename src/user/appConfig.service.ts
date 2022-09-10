import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AppConfigModel } from './models/appConfig.model';

const appConfigProjection = {
  __v: false,
  _id: false,
};

@Injectable()
export class AppConfigService {
  constructor(
    @InjectModel('AppConfig')
    private readonly appConfigModel: Model<AppConfigModel>,
  ) {}

  public async getAppConfig(): Promise<AppConfigModel> {
    return await this.appConfigModel.findOne({}, appConfigProjection).exec();
  }

  public async updateAppConfig(
    newAppConfig: AppConfigModel,
  ): Promise<AppConfigModel> {
    await this.appConfigModel.deleteMany({}).exec();
    const appConfig = await this.appConfigModel.create(newAppConfig);
    await appConfig.validate();
    await appConfig.save();
    return appConfig;
  }
}
