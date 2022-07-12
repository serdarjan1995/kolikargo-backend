import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsEnum,
  ValidateIf,
} from 'class-validator';

export enum AddressType {
  SENDER = 'sender',
  RECEIVER = 'receiver',
}

export class UserAddressModel {
  @IsNotEmpty()
  @IsString()
  @IsEnum(AddressType)
  readonly type: string;

  @IsNotEmpty()
  @IsBoolean()
  readonly isDefault: boolean;

  @IsNotEmpty()
  @IsString()
  readonly contactName: string;

  @IsNotEmpty()
  @IsString()
  readonly contactSurname: string;

  @IsNotEmpty()
  @IsString()
  readonly contactPhoneNumber: string;

  @ValidateIf((o) => o.type === AddressType.SENDER)
  @IsString()
  @IsNotEmpty()
  readonly country: string;

  @ValidateIf((o) => o.type === AddressType.SENDER)
  @IsString()
  @IsNotEmpty()
  readonly province: string;

  @ValidateIf((o) => o.type === AddressType.SENDER)
  @IsString()
  @IsNotEmpty()
  readonly city: string;

  @ValidateIf((o) => o.type === AddressType.SENDER)
  @IsString()
  @IsNotEmpty()
  readonly district: string;

  @ValidateIf((o) => o.type === AddressType.SENDER)
  @IsString()
  @IsNotEmpty()
  readonly houseNo: string;

  @ValidateIf((o) => o.type === AddressType.SENDER)
  @IsString()
  @IsNotEmpty()
  readonly floorNo: string;

  @ValidateIf((o) => o.type === AddressType.SENDER)
  @IsString()
  @IsNotEmpty()
  readonly doorNo: string;

  @ValidateIf((o) => o.type === AddressType.RECEIVER)
  @IsString()
  @IsNotEmpty()
  readonly addressLine: string;

  user: any;
}
