import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CARGO_STATUSES } from './cargo.model';

export class CargoTrackingModel {
  @IsNotEmpty()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ID of the cargo tracking',
  })
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(CARGO_STATUSES)
  @ApiProperty({
    description: 'Status of the cargo',
    enum: CARGO_STATUSES,
    example: CARGO_STATUSES.SHIPPED,
  })
  readonly status: string;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({
    description: 'Tracking datetime',
  })
  datetime: Date;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Optional note from cargo supplier',
  })
  note: Date;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'cargo instance related to this tracking',
  })
  cargo: any;
}

export class CargoTrackingListModel extends OmitType(CargoTrackingModel, [
  'id',
  'status',
  'datetime',
  'note',
] as const) {}
