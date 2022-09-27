import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CARGO_TYPES } from '../../cargo-pricing/models/cargoPricing.model';

export class CargoTypeModel {
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
