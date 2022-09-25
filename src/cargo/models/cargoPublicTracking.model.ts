import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CargoTrackingModel } from './cargoTracking.model';
import { ApiProperty } from '@nestjs/swagger';
import { CargoModel } from './cargo.model';

export class CargoPublicTrackingModel extends CargoModel {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CargoTrackingModel)
  @ApiProperty({
    description: 'Cargo prices per cargoType',
    example: [
      {
        status: 'NEW_REQUEST',
        datetime: '2022-09-10T10:46:25.580Z',
        note: '',
        id: '28931b82-e8f3-4d7d-823d-45b6593f30e0',
      },
    ],
  })
  tracking: CargoTrackingModel[];
}
