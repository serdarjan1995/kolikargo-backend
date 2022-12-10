import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CARGO_STATUSES } from './cargo.model';

export class ListFilterSupplierCargosModel {
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ApiPropertyOptional({
    name: 'Start date to filter',
  })
  readonly startDate: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @ApiPropertyOptional({
    name: 'End date to filter',
  })
  readonly endDate: Date;

  @IsString()
  @IsEnum(CARGO_STATUSES)
  @IsOptional()
  @Type(() => String)
  @ApiPropertyOptional({
    name: 'Cargo status to filter',
  })
  readonly status: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    name: 'Page number',
  })
  readonly page: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    name: 'Items per page',
  })
  readonly perPage: number;
}
