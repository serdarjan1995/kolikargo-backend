import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType, PickType } from '@nestjs/swagger';
import {
  CARGO_METHODS,
  CARGO_TYPES,
} from '../../cargo-pricing/models/cargoPricing.model';
import { Type } from 'class-transformer';
import { UserAddressDetailModel } from '../../user-address/models/userAddress.model';

export enum CARGO_STATUSES {
  NEW_REQUEST = 'NEW_REQUEST',
  AWAITING_PICKUP = 'AWAITING_PICKUP',
  RECEIVED = 'RECEIVED',
  AWAITING_SHIPMENT = 'AWAITING_SHIPMENT',
  SHIPPED = 'SHIPPED',
  ARRIVED_AT_DESTINATION_COUNTRY = 'ARRIVED_AT_DESTINATION_COUNTRY',
  AWAITING_DELIVERY = 'AWAITING_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  UNKNOWN = 'UNKNOWN',
}

export class CargoModel {
  @IsNotEmpty()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ID of the cargo',
  })
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(CARGO_STATUSES)
  @ApiProperty({
    description: 'Status of the cargo',
    enum: CARGO_STATUSES,
    example: CARGO_STATUSES.NEW_REQUEST,
  })
  readonly status: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Weight of the cargo',
  })
  readonly weight: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(CARGO_TYPES)
  @ApiProperty({
    description: 'Type of the cargo to be sent',
    enum: CARGO_TYPES,
    example: CARGO_TYPES.TEXTILE,
  })
  readonly cargoType: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(CARGO_METHODS)
  @ApiProperty({
    description: 'Shipment method of the cargo',
    enum: CARGO_METHODS,
    example: CARGO_METHODS.TRUCK,
  })
  readonly cargoMethod: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Source location',
  })
  sourceLocation: any;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Destination Location',
  })
  destinationLocation: any;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Pickup address of the cargo',
  })
  pickupAddress: UserAddressDetailModel;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @ApiProperty({
    description: 'Desired pickup date',
    example: '2022-12-15',
  })
  readonly pickupDate: Date;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Desired pickup time range',
  })
  readonly pickupTime: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Delivery address of the cargo',
  })
  deliveryAddress: UserAddressDetailModel;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Selected cargo supplier',
  })
  supplier: any;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'User who owns the cargo',
  })
  user: any;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Note to courier',
  })
  note: any;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Used coupon',
  })
  readonly usedCoupon: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Fee of the cargo shipment',
  })
  fee: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Cost of the cargo shipment',
  })
  service_fee: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Cost of the cargo shipment',
  })
  total_fee: number;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({
    description: 'Estimated Delivery Date',
  })
  estimatedDeliveryDate: Date;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Tracking Number',
  })
  trackingNumber: string;
}

export class CreateCargoModel extends OmitType(CargoModel, [
  'id',
  'total_fee',
  'service_fee',
  'fee',
  'status',
  'user',
  'estimatedDeliveryDate',
  'trackingNumber',
] as const) {}

export class UpdateCargoStatusModel extends PickType(CargoModel, [
  'status',
] as const) {}
