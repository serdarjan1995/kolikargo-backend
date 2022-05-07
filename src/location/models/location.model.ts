import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class LocationModel {
  @IsNotEmpty()
  @IsString()
  readonly country: string;

  @IsNotEmpty()
  @IsString()
  readonly city: string;

  @IsOptional()
  @IsString()
  readonly address: string;

  @IsOptional()
  @IsBoolean()
  readonly enabled: boolean;
}
