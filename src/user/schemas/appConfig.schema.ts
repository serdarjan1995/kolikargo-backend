import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AppConfigAnnouncement extends Document {
  @Prop({
    required: true,
    type: Boolean,
  })
  enabled: boolean;

  @Prop({ required: true, type: {} })
  messages: object;
}

export const AppConfigAnnouncementSchema = SchemaFactory.createForClass(
  AppConfigAnnouncement,
);

@Schema()
export class AppConfigStoreLinks extends Document {
  @Prop({
    required: true,
    type: String,
  })
  ios: string;

  @Prop({
    required: true,
    type: String,
  })
  android: string;
}

export const AppConfigStoreLinksSchema =
  SchemaFactory.createForClass(AppConfigStoreLinks);

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

  @Prop({
    required: true,
    type: AppConfigAnnouncementSchema,
  })
  announcement: typeof AppConfigAnnouncementSchema;

  @Prop({
    required: true,
    type: AppConfigAnnouncementSchema,
  })
  maintenance: typeof AppConfigAnnouncementSchema;

  @Prop({
    required: true,
    type: AppConfigStoreLinksSchema,
  })
  store_links: typeof AppConfigStoreLinksSchema;
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
