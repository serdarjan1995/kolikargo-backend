import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';

export class CargoPricingModel {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ID of the cargo pricing',
  })
  readonly id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Cargo method',
  })
  cargoMethod: any;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Cargo method',
  })
  cargoType: any;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Price per weight',
    example: 1.5,
  })
  readonly price: number;

  @IsString()
  @ApiProperty({
    description: 'Supplier ID if coupon type is COMPANY',
  })
  supplier: any;
}

export class CreateCargoPricingModel extends OmitType(CargoPricingModel, [
  'id',
] as const) {}
