import { IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StartDateEndDateQueryModel {
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @ApiProperty({
    name: 'Start date to filter',
  })
  readonly startDate: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  @ApiProperty({
    name: 'End date to filter',
  })
  readonly endDate: Date;
}
