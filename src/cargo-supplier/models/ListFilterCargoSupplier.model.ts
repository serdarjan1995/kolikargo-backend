import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CARGO_METHODS, CARGO_TYPES } from '../../cargo-pricing/models/cargoPricing.model';

export class ListFilterCargoSupplierModel {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    name: 'Name to filter (includes pattern)',
  })
  readonly name: string;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description:
      'Featured/non-featured cargo suppliers only. Leave empty for all',
  })
  @Type(() => Boolean)
  readonly featured: boolean;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Min weight of the service',
    example: 15,
  })
  readonly minWeight: number;

  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Max weight of the service',
    example: 30,
  })
  readonly maxWeight: number;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Providing service source location. Get valid location ids from `/location` endpoint',
    example: '986dcaf4-c1ea-4218-b6b4-e4fd95a3c28e',
  })
  sourceLocation: string;

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Providing service destination location. Get valid location ids from `/location` endpoint',
    example: '986dcaf4-c1ea-4218-b6b4-e4fd95a3c28e',
  })
  destinationLocation: string;

  @IsString()
  @IsEnum(CARGO_TYPES)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Cargo Type',
    enum: CARGO_TYPES,
    example: CARGO_TYPES.FURNITURE,
  })
  cargoType: string;

  @IsString()
  @IsEnum(CARGO_METHODS)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Cargo Method',
    enum: CARGO_METHODS,
    example: CARGO_METHODS.TRUCK,
  })
  cargoMethod: string;
}
