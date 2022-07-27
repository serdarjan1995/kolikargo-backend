import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

  @IsUUID()
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'Cargo Type id to filter if supplier is providing service to send specific cargo type. ' +
      'Get valid cargo type ids from `/cargo-type` endpoint',
    example: '986dcaf4-c1ea-4218-b6b4-e4fd95a3c28e',
  })
  cargoType: string;
}
