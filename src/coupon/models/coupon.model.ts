import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

export enum COUPON_TYPES {
  UNIVERSAL = 'universal',
  COMPANY = 'company',
}

export enum COUPON_DISCOUNT_TYPES {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export class CouponModel {
  readonly _id: Types.ObjectId;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ID of the cargo method',
  })
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Coupon title',
  })
  readonly title: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Coupon description',
  })
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Coupon code',
  })
  readonly code: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(COUPON_TYPES)
  @ApiProperty({
    description: 'Coupon type',
    enum: COUPON_TYPES,
    example: COUPON_TYPES.UNIVERSAL,
  })
  readonly type: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(COUPON_DISCOUNT_TYPES)
  @ApiProperty({
    description: 'Coupon discount type',
    enum: COUPON_DISCOUNT_TYPES,
    example: COUPON_DISCOUNT_TYPES.FIXED,
  })
  readonly discountType: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Coupon discount value',
    example: 10,
  })
  readonly discountValue: number;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    description: 'Min weight for this coupon to be valid',
  })
  readonly minWeight: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ApiPropertyOptional({
    description: 'Expire Date for this coupon (optional)',
    example: '2022-12-15T00:00:00',
  })
  readonly expires: Date;

  @ValidateIf((o) => o.type === COUPON_TYPES.COMPANY)
  @IsString()
  @ApiPropertyOptional({
    description: 'Supplier ID if coupon type is COMPANY',
  })
  supplier: any;
}

export class CreateCouponModel extends OmitType(CouponModel, ['id'] as const) {}

export class ValidateCouponModel extends PickType(CouponModel, [
  'code',
  'supplier',
] as const) {}
