import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AppConfigAnnouncementModel {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'is enabled',
  })
  readonly enabled: boolean;

  @IsNotEmpty()
  @IsObject()
  @ApiProperty({
    description: 'messages',
  })
  readonly messages: object;

  @IsNotEmpty()
  @IsObject()
  @ApiProperty({
    description: 'title',
  })
  readonly title: object;
}

export class AppConfigStoreLinksModel {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'android app link',
  })
  readonly android: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'ios app link',
  })
  readonly ios: string;
}

export class AppConfigModel {
  @IsNotEmpty()
  @IsArray()
  @Type(() => String)
  @ApiProperty({
    description: 'Must update / forced update versions',
  })
  readonly must_update_versions: string[];

  @IsNotEmpty()
  @IsArray()
  @Type(() => String)
  @ApiProperty({
    description: 'Should update / preferred update versions',
  })
  readonly should_update_versions: string[];

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'Clean local caches',
  })
  readonly forced_cache_clean: boolean;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Latest version',
  })
  readonly latest_version: string;

  @IsNotEmpty()
  @Type(() => AppConfigAnnouncementModel)
  @ValidateNested({ each: true })
  @ApiProperty({
    description: 'Announcement messages to show to users',
  })
  readonly announcement: AppConfigAnnouncementModel;

  @IsNotEmpty()
  @Type(() => AppConfigAnnouncementModel)
  @ValidateNested({ each: true })
  @ApiProperty({
    description: 'Maintenance messages to show to users',
  })
  readonly maintenance: AppConfigAnnouncementModel;

  @IsNotEmpty()
  @Type(() => AppConfigStoreLinksModel)
  @ValidateNested({ each: true })
  @ApiProperty({
    description: 'App store links',
  })
  readonly store_links: AppConfigStoreLinksModel;

  @IsNotEmpty()
  @Type(() => AppConfigAnnouncementModel)
  @ValidateNested({ each: true })
  @ApiProperty({
    description: 'Not available for pickup announcement',
  })
  readonly notAvailableForPickUpAnnouncement: AppConfigAnnouncementModel;
}
