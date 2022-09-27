import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CampaignModel, CreateCampaignModel } from './models/campaign.model';

const campaignsProjection = {
  __v: false,
  _id: false,
};

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel('Campaign')
    private readonly campaignModel: Model<CampaignModel>,
  ) {}

  public async getCampaigns(all = false): Promise<CampaignModel[]> {
    const filter = {};
    if (!all) filter['enabled'] = true;

    return await this.campaignModel.find(filter, campaignsProjection).exec();
  }

  public async getCampaign(filter): Promise<CampaignModel> {
    return await this.campaignModel.findOne(filter, campaignsProjection).exec();
  }

  public async createCampaign(
    newCampaign: CreateCampaignModel,
  ): Promise<CampaignModel> {
    const campaign = await this.campaignModel.create(newCampaign);
    await campaign.validate();
    await campaign.save();

    return await this.getCampaign({ id: campaign.id });
  }

  public async updateCampaign(
    id: string,
    updateParams: object,
  ): Promise<CampaignModel> {
    const campaign = await this.campaignModel.findOneAndUpdate(
      { id: id },
      updateParams,
    );

    return await this.getCampaign({ id: campaign.id });
  }
}
