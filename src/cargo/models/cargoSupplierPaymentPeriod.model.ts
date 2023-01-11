import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PAYMENT_STATUS } from './cargoSupplierPayment.model';
import { Type } from 'class-transformer';

export class CargoSupplierPaymentPeriodModel {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: 'Period',
    required: true,
  })
  period: Date;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'Total revenue from cargo operations for the period',
  })
  totalRevenue: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'Total profit of the period',
  })
  totalProfit: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'Total commission taken from supplier for the period',
  })
  totalSupplierCommission: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'Total commission taken from customer for the period',
  })
  totalCustomerCommission: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'Total commission should be paid for the period',
  })
  totalCommission: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(PAYMENT_STATUS)
  @ApiProperty({
    description: 'Status of the payment',
    enum: PAYMENT_STATUS,
    example: PAYMENT_STATUS.PAID,
  })
  paymentStatus: string;
}

export class CargoSupplierPaymentPeriodQueryModel {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: 'Period',
    required: true,
  })
  period: Date;
}
