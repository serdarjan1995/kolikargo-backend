import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CampaignService } from './campaign.service';
import { CreateCampaignModel } from './models/campaign.model';

@Controller('campaigns')
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  @Get()
  public async getCampaigns() {
    return await this.campaignService.getCampaigns();
  }

  @Post()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  public async createCampaign(@Body() campaign: CreateCampaignModel) {
    return await this.campaignService.createCampaign(campaign);
  }

  @Put(':id')
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  public async updateCampaign(
    @Body() campaignUpdateParams,
    @Param('id') id: string,
  ) {
    return await this.campaignService.updateCampaign(id, campaignUpdateParams);
  }
}
