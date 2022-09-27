import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';

@Schema()
export class CampaignAction extends Document {
  @Prop({
    required: false,
    type: String,
    default: null,
  })
  type: string | null;

  @Prop({
    required: false,
    type: String,
    default: null,
  })
  location: string | null;
}

export const CampaignActionSchema =
  SchemaFactory.createForClass(CampaignAction);

@Schema()
export class Campaign extends Document {
  @Prop({
    type: String,
    unique: true,
    default: function genUUID() {
      return uuidV4();
    },
  })
  id: string;

  @Prop({
    required: true,
    type: Boolean,
  })
  enabled: boolean;

  @Prop({
    required: true,
    type: String,
  })
  imageUrl: string;

  @Prop({
    required: true,
    type: CampaignActionSchema,
  })
  action: typeof CampaignActionSchema;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
