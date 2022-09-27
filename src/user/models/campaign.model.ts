import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CampaignActionModel {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Campaign action',
    default: null,
  })
  readonly type: string | null;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'action location',
    default: null,
  })
  readonly location: string | null;
}

export class CampaignModel {
  readonly _id: Types.ObjectId;

  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the campaign',
  })
  id: string;

  @IsNotEmpty()
  @IsBoolean()
  @Type(() => Boolean)
  @ApiProperty({
    description: 'Is enabled',
  })
  readonly enabled: boolean;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Banner image url',
  })
  readonly imageUrl: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CampaignActionModel)
  @ApiProperty({
    description: 'Action to take on campaign click',
  })
  readonly action: CampaignActionModel;
}

export class CreateCampaignModel extends OmitType(CampaignModel, [
  'id',
] as const) {}
