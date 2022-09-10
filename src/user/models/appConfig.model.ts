import { IsArray, IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AppConfigModel {
  @IsNotEmpty()
  @IsArray()
  @Type(() => Number)
  @ApiProperty({
    description: 'Must update / forced update versions',
  })
  readonly must_update_versions: number[];

  @IsNotEmpty()
  @IsArray()
  @Type(() => Number)
  @ApiProperty({
    description: 'Should update / preferred update versions',
  })
  readonly should_update_versions: number[];

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    description: 'Clean local caches',
  })
  readonly forced_cache_clean: boolean;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Latest version',
  })
  readonly latest_version: number;
}