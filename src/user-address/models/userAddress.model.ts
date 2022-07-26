import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsEnum,
  ValidateIf,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';

export enum AddressType {
  SENDER = 'sender',
  RECEIVER = 'receiver',
}

export class UserAddressModel {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ID of the user address',
  })
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(AddressType)
  @ApiProperty({
    description: 'Address type',
    enum: AddressType,
  })
  readonly type: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'Is default address',
  })
  readonly isDefault: boolean;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Contact person name',
  })
  readonly contactName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Contact person surname',
  })
  readonly contactSurname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Contact person phone number',
  })
  readonly contactPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Address country: 2 letter ISO code',
  })
  readonly country: string;

  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'Address province (inner country)',
  })
  readonly province: string;

  @ValidateIf((o) => o.type === AddressType.SENDER)
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'Address city (inner province)',
  })
  readonly city: string;

  @ValidateIf((o) => o.type === AddressType.SENDER)
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'Address district (inner city)',
  })
  readonly district: string;

  @ValidateIf((o) => o.type === AddressType.SENDER)
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'Address house number',
  })
  readonly houseNo: string;

  @ValidateIf((o) => o.type === AddressType.SENDER)
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'Address floor number',
  })
  readonly floorNo: string;

  @ValidateIf((o) => o.type === AddressType.SENDER)
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'Address door number (inner house)',
  })
  readonly doorNo: string;

  @ValidateIf((o) => o.type === AddressType.RECEIVER)
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({
    description: 'Address line (free entry - street name etc...',
  })
  readonly addressLine: string;

  user: any;
}

export class CreateUserAddressModel extends OmitType(UserAddressModel, [
  'id',
] as const) {}
