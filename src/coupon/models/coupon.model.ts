import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export enum CouponType {
  UNIVERSAL = 'universal',
  COMPANY = 'company',
}

export enum CouponDiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export class CouponModel {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  readonly code: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(CouponType)
  readonly type: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(CouponDiscountType)
  readonly discountType: string;

  @IsNumber()
  @IsNotEmpty()
  readonly discountValue: number;

  @IsOptional()
  @IsNumber()
  readonly minWeight: number;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  readonly expires: Date;

  @ValidateIf((o) => o.type === CouponType.COMPANY)
  @IsString()
  supplier: any;
}
