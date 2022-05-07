import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Role } from '../../auth/role.enum';

export class UserModel {
  @IsOptional()
  id: string;

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly surname: string;

  @IsNotEmpty()
  @IsString()
  readonly phoneNumber: string;

  readonly roles: Role[];
}

export class UserLogin {
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsNumber()
  code: number;
}

export class UserRegister {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  surname: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}

export class RequestCode {
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}
