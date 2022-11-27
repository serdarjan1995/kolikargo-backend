import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject, IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export enum CARGO_METHODS {
  AIR = 'air',
  TRUCK = 'truck',
}

export enum CARGO_TYPES {
  TEXTILE = 'textile',
  TEXTILE_SERIAL = 'textile_serial',
  TEXTILE_MIXED = 'textile_mixed',
  FURNITURE = 'furniture',
  FURNITURE_SMALL = 'furniture_small',
  FURNITURE_HEAVY = 'furniture_heavy',
  FOOD = 'food',
  ELECTRONICS = 'electronics',
  ELECTRONICS_TABLET = 'electronics_tablet', // TODO requiresPickupFee
  ELECTRONICS_MOBILE = 'electronics_mobile',
  ELECTRONICS_TV = 'electronics_tv',
  ELECTRONICS_COMPUTER = 'electronics_computer',
  ELECTRONICS_OTHER = 'electronics_other',
  HOUSEHOLD_APPLIANCES = 'household_appliances',
  SPARE_PARTS = 'spare_parts',
  COSMETICS = 'cosmetics',
  DOCUMENTS = 'documents',
  MEDICINE = 'medicine',
  OTHER = 'other',
}

export class CargoTypeIconModel {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Cargo type icon white color',
  })
  readonly white: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Cargo type icon dark color',
  })
  readonly dark: string;
}

export class CargoTypeModel {
  readonly _id: Types.ObjectId;

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
    description: 'Cargo type name',
  })
  readonly name: string;

  @ValidateNested({ each: true })
  @Type(() => CargoTypeIconModel)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Cargo type icons',
  })
  readonly icons: CargoTypeIconModel;

  @IsNotEmpty()
  @IsObject()
  @ApiProperty({
    description: 'translations',
  })
  readonly translations: object;

  @IsOptional()
  @ApiProperty({
    description: 'order',
  })
  readonly order: number;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'Does this cargo type has sub-type',
  })
  readonly hasSubType: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'Is this cargo type is sub-type',
  })
  readonly isSubType: boolean;

  @ApiProperty({
    description: 'Parent',
    required: false,
  })
  parent: any;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CargoTypeModel)
  @ApiPropertyOptional({
    description: 'SubTypes',
    required: false,
  })
  subTypes: CargoTypeModel[];
}

export class CreateUpdateCargoTypeModel extends OmitType(CargoTypeModel, [
  'id',
  'subTypes',
] as const) {}
