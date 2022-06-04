import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CargoMethodModel {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description: string;
}
