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
    type: [String],
  })
  must_update_versions: [string];

  @Prop({
    required: true,
    type: [String],
  })
  should_update_versions: [string];

  @Prop({
    required: true,
    type: String,
  })
  latest_version: string;

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

  @Prop({
    required: true,
    type: AppConfigAnnouncementSchema,
  })
  notAvailableForPickUpAnnouncement: typeof AppConfigAnnouncementSchema;
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
