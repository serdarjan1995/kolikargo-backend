import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SupplierAuthCodeModel {
  @IsNotEmpty()
  @IsString()
  readonly phoneNumber: string;

  @IsNotEmpty()
  @IsNumber()
  readonly code: number;

  @IsNotEmpty()
  @IsDate()
  readonly expires: Date;
}
