import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CATEGORY {
  COUNTRY = 'country',
  PROVINCE = 'province',
  CITY = 'city',
  DISTRICT = 'district',
}

export class AdministrativeAreaModel {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Country',
  })
  readonly country: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Name of administrative area',
  })
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Category of administrative area',
    enum: CATEGORY,
  })
  readonly category: string;

  @IsOptional()
  @IsString()
  // @ApiProperty({
  //   description: 'Parent administrative area',
  // })
  readonly parent: string;

  @IsOptional()
  @IsString()
  // @ApiProperty({
  //   description: 'Parent administrative area category',
  //   enum: CATEGORY,
  // })
  readonly parentCategory: string;

  @IsOptional()
  @IsString()
  // @ApiProperty({
  //   description: 'Child administrative area',
  // })
  readonly child: string;

  @IsOptional()
  @IsString()
  // @ApiProperty({
  //   description: 'Child administrative area category',
  //   enum: CATEGORY,
  // })
  readonly childCategory: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Code of the administrative area',
  })
  readonly code: string;
}

export class FilterAdministrativeArea {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Country',
  })
  readonly country: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Name of the parent administrative area',
  })
  readonly parentName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Category of administrative area',
    enum: CATEGORY,
  })
  readonly category: string;
}
