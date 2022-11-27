import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { LoginType } from '../../auth/auth.service';

export class AuthCodeModel {
  @IsNotEmpty()
  @IsString()
  readonly phoneNumber: string;

  @IsNotEmpty()
  @IsNumber()
  readonly code: number;

  @IsNotEmpty()
  @IsDate()
  readonly expires: Date;

  @IsNotEmpty()
  @IsString()
  @IsEnum(LoginType)
  readonly type: LoginType;
}
