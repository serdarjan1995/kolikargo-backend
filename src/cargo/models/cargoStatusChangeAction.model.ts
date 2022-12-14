import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsUUID, Validate, ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { CARGO_STATUSES } from './cargo.model';

export class CargoStatusChangeActionModel {
  readonly _id: Types.ObjectId;

  @IsNotEmpty()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ID of the cargo action',
  })
  readonly id: string;

  @IsNotEmpty()
  @IsEnum(CARGO_STATUSES)
  @ApiProperty({
    description: 'From status',
    enum: CARGO_STATUSES,
    example: CARGO_STATUSES.SHIPPED,
  })
  readonly fromStatus: string;

  @IsEnum(CARGO_STATUSES, { each: true })
  @ApiProperty({
    description: 'Available statuses to change',
    enum: CARGO_STATUSES,
    isArray: true,
    example: [CARGO_STATUSES.DELIVERED],
  })
  readonly toStatuses: CARGO_STATUSES[];

  @IsEnum(CARGO_STATUSES, { each: true })
  @ApiProperty({
    description: 'Past statuses (successful)',
    enum: CARGO_STATUSES,
    isArray: true,
    example: [CARGO_STATUSES.DELIVERED],
  })
  readonly pastStatuses: CARGO_STATUSES[];

  @IsEnum(CARGO_STATUSES, { each: true })
  @ApiProperty({
    description: 'Next statuses to display but no ability to change',
    enum: CARGO_STATUSES,
    isArray: true,
    example: [CARGO_STATUSES.DELIVERED],
  })
  readonly nextDisabledStatuses: CARGO_STATUSES[];

  @IsObject()
  @ValidateIf((object, value) => value !== null)
  @ApiProperty({
    description: 'Confirmation messages',
  })
  readonly confirmationMessages: object | null;
}

export class CreateCargoStatusChangeActionModel extends OmitType(
  CargoStatusChangeActionModel,
  ['id'] as const,
) {}
