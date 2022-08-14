import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';

export enum CARGO_METHODS {
  AIR = 'air',
  TRUCK = 'truck',
}

export enum CARGO_TYPES {
  TEXTILE = 'textile',
  FURNITURE = 'furniture',
  FOOD = 'food',
  ELECTRONICS = 'electronics',
  OTHER = 'other',
}

export class CargoPricingModel {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ID of the cargo pricing',
  })
  readonly id: string;

  @IsString()
  @IsEnum(CARGO_METHODS)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Cargo method',
    enum: CARGO_METHODS,
    example: CARGO_METHODS.TRUCK,
  })
  cargoMethod: string;

  @IsString()
  @IsEnum(CARGO_TYPES)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Cargo type',
  })
  cargoType: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Price per weight',
    example: 1.5,
  })
  readonly price: number;

  @IsString()
  @ApiProperty({
    description: 'Supplier (owner) of the pricing',
  })
  supplier: any;
}

export class CreateCargoPricingModel extends OmitType(CargoPricingModel, [
  'id',
] as const) {}
