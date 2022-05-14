import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CargoSupplierModel {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly description: string;

  @IsString()
  readonly avatarUrl: string;

  @IsOptional()
  @IsNumber()
  readonly stars: number;

  @IsOptional()
  @IsNumber()
  readonly reviewsCount: number;

  @IsArray()
  @IsOptional()
  reviews: any[];

  @IsNotEmpty()
  @IsBoolean()
  readonly freePackaging: boolean;

  @IsNotEmpty()
  @IsNumber()
  readonly minWeight: number;

  @IsNotEmpty()
  @IsNumber()
  readonly deliveryEstimationMin: number;

  @IsNotEmpty()
  @IsNumber()
  readonly deliveryEstimationMax: number;

  @IsNotEmpty()
  @IsString()
  readonly phoneNumber: string;

  user: any;

  @IsOptional()
  @IsBoolean()
  readonly featured: boolean;

  @IsArray()
  serviceSourceLocations: any[];

  @IsArray()
  serviceDestinationLocations: any[];
}
