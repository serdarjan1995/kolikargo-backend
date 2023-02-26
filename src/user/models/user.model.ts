import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from '../../auth/role.enum';
import { ApiProperty, ApiPropertyOptional, OmitType, PickType } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { LoginType } from '../../auth/auth.service';

export class UserModel {
  readonly _id: Types.ObjectId;

  @IsOptional()
  @ApiProperty({
    description: 'ID of the user',
  })
  id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of the user',
  })
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Surname of the user',
  })
  readonly surname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Phone number of the user',
  })
  readonly phoneNumber: string;

  @IsEnum(Role, { each: true })
  @IsOptional()
  @ApiProperty({
    description: 'User roles',
    isArray: true,
    enum: Role,
  })
  readonly roles: Role[];

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({
    description: 'User created at',
  })
  readonly createdAt: Date;
}

export class UpdateUserProfileModel extends PickType(UserModel, [
  'name',
  'surname',
] as const) {}

export class CreateUserModelAdmin extends OmitType(UserModel, [
  'createdAt',
  'id',
  '_id',
] as const) {}

export class UserLogin {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Phone number of the user',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Received authentication code',
    example: 123456,
  })
  authCode: number;
}

export class UserRegister {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of the User',
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Surname of the user',
  })
  surname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Phone number of the user',
  })
  phoneNumber: string;
}

export class RequestCode {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Phone number to login. Successful response will send sms',
  })
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(LoginType)
  @ApiPropertyOptional({
    description: 'Login type',
    default: LoginType.customer,
  })
  type: LoginType = LoginType.customer;
}

export class AuthenticatedUser {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'ID of the user',
  })
  id: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(LoginType)
  @ApiProperty({
    description: 'Type of authenticated user',
  })
  type: LoginType;

  @IsNotEmpty()
  @IsArray()
  @ApiProperty({
    description: 'User roles',
  })
  roles: string[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Phone number of the user',
  })
  phoneNumber: string;
}
