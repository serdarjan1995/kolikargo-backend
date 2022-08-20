import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

export class CargoPriceFieldModel {
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
}

export class CargoPricingModel {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
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

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CargoPriceFieldModel)
  @ApiProperty({
    description: 'Cargo prices per cargoType',
    example: [
      {
        cargoType: CARGO_TYPES.ELECTRONICS,
        price: 1.9,
      },
    ],
  })
  prices: CargoPriceFieldModel[];

  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({
    description: 'Selected locations of the pricing',
    example: [
      '9322c384-fd8e-4a13-80cd-1cbd1ef95ba8',
      '12345384-fd8e-4a13-80cd-bcda338feacd',
    ],
  })
  locations: any[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Supplier (owner) of the pricing',
  })
  supplier: any;
}

export class CreateCargoPricingModel extends OmitType(CargoPricingModel, [
  'id',
] as const) {}
