import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AppConfig extends Document {
  @Prop({
    required: true,
    type: [Number],
  })
  must_update_versions: [number];

  @Prop({
    required: true,
    type: [Number],
  })
  should_update_versions: [number];

  @Prop({
    required: true,
    type: Number,
  })
  latest_version: number;

  @Prop({
    required: true,
    type: Boolean,
  })
  forced_cache_clean: boolean;
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
