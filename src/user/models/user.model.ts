import { IsNotEmpty, IsString } from 'class-validator';

export class UserModel {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly surname: string;

  @IsNotEmpty()
  @IsString()
  readonly phoneNumber: string;
}
