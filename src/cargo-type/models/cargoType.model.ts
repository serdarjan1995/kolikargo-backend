import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';

export class CargoTypeModel {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({
    description: 'ID of the cargo type',
  })
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Cargo type',
  })
  readonly name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Cargo type description',
  })
  readonly description: string;
}

export class CreateCargoTypeModel extends OmitType(CargoTypeModel, [
  'id',
] as const) {}
