import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CargoMethodModel {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ID of the cargo method',
  })
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Cargo method',
  })
  readonly name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Cargo method description',
  })
  readonly description: string;
}
