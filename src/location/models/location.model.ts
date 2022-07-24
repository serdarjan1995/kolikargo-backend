import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';

export class LocationModel {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ID of the location',
  })
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Location country code (2 letter ISO code)',
  })
  readonly country: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Location city name',
  })
  readonly city: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Optional address line',
  })
  readonly address: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Is location enabled for listing',
  })
  readonly enabled: boolean;
}

export class CreateLocationModel extends OmitType(LocationModel, [
  'id',
] as const) {}
