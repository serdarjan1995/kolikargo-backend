import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SupplierCargoStatsModel {
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    name: 'Number of new cargos',
  })
  newCargos: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    name: 'Number of in-progress cargos',
  })
  inProgressCargos: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    name: 'Number of delivered cargos',
  })
  deliveredCargos: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    name: 'Number of total cargos',
  })
  totalCargos: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    name: 'Profit from cargos',
  })
  profit: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    name: '15 day commission payment',
  })
  commissionPayments: number;
}
