import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export enum COMMISSION_TYPES {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE',
}

export class CommissionTypeModel {
  @IsEnum(COMMISSION_TYPES)
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Commission type',
    example: COMMISSION_TYPES.FIXED,
  })
  readonly type: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Commission value',
  })
  readonly value: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Min qty/weight for the commission',
    default: 1,
  })
  readonly minRange: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Max qty/weight for the commission',
    default: 1,
  })
  readonly maxRange: number;
}

export class CargoSupplierCommissionsModel {
  readonly _id: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Cargo supplier',
  })
  supplier: any;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CommissionTypeModel)
  @ApiProperty({
    description: 'Per item commission',
  })
  perItemCommission: CommissionTypeModel[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CommissionTypeModel)
  @ApiProperty({
    description: 'Per weight commission',
  })
  perWeightCommission: CommissionTypeModel[];
}

export class CreateCargoSupplierCommissionModel extends OmitType(
  CargoSupplierCommissionsModel,
  ['_id', 'supplier'] as const,
) {}
