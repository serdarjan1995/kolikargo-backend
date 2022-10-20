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
import { CARGO_TYPES, CARGO_METHODS } from '../../cargo/models/cargoType.model';

export enum PRICING_TYPE {
  PER_ITEM = 'per_item',
  PER_WEIGHT = 'per_weight',
}

export class CargoPriceFieldModel {
  @IsString()
  @IsEnum(CARGO_TYPES)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Cargo type',
  })
  cargoType: string;

  @IsString()
  @IsEnum(PRICING_TYPE)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Cargo type',
    example: PRICING_TYPE.PER_WEIGHT,
    default: PRICING_TYPE.PER_WEIGHT,
  })
  pricingType: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Price per weight/item',
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
    description: 'Selected source locations of the pricing',
    example: [
      '9322c384-fd8e-4a13-80cd-1cbd1ef95ba8',
      '12345384-fd8e-4a13-80cd-bcda338feacd',
    ],
  })
  sourceLocations: any[];

  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty({
    description: 'Selected destination locations of the pricing',
    example: [
      '9322c384-fd8e-4a13-80cd-1cbd1ef95ba8',
      '12345384-fd8e-4a13-80cd-bcda338feacd',
    ],
  })
  destinationLocations: any[];

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
