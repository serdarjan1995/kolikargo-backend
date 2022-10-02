import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { CARGO_TYPES } from '../../cargo-pricing/models/cargoPricing.model';

export class CargoTypeModel {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    description: 'ID of the cargo type',
  })
  readonly id: string;

  @IsString()
  @IsEnum(CARGO_TYPES)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Cargo type',
  })
  name: string;

  @IsNotEmpty()
  @IsObject()
  @ApiProperty({
    description: 'translations',
  })
  readonly translations: object;
}

export class CreateUpdateCargoTypeModel extends OmitType(CargoTypeModel, [
  'id',
] as const) {}
