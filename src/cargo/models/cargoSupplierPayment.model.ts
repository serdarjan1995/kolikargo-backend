import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

export enum PAYMENT_STATUS {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export class CargoSupplierPaymentModel {
  readonly _id: Types.ObjectId;

  @IsNotEmpty()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ID of the supplier payment',
  })
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Cargo supplier',
  })
  supplier: any;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Cargo',
  })
  cargo: any;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({
    description: 'Created datetime of this commission',
  })
  datetime: Date;

  @IsOptional()
  @IsDate()
  @ApiPropertyOptional({
    description: 'Datetime period of this commission that belongs to',
    required: false,
  })
  period: Date;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'Revenue from cargo operation',
  })
  revenue: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'Profit from cargo operation',
  })
  profit: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'Commission taken from supplier',
  })
  supplierCommission: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'Commission taken from customer',
  })
  customerCommission: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'Total commission should be paid',
  })
  commission: number;

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

export class CreateCargoSupplierPaymentModel extends OmitType(
  CargoSupplierPaymentModel,
  ['id', 'datetime', 'period'] as const,
) {}

export class CreateCargoSupplierPaymentPeriodModel {
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: 'Datetime period to create',
    required: true,
  })
  period: Date;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Cargo supplier',
  })
  supplier: any;
}

export class ChangeCargoSupplierPaymentPeriodPaymentStatusModel extends PickType(
  CargoSupplierPaymentModel,
  ['period', 'paymentStatus'] as const,
) {}
