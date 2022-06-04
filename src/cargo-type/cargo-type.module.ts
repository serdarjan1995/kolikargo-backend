import { Module } from '@nestjs/common';
import { CargoTypeController } from './cargo-type.controller';
import { CargoTypeService } from './cargo-type.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CargoTypeSchema } from './schemas/cargoType.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'CargoType',
        schema: CargoTypeSchema,
      },
    ]),
  ],
  controllers: [CargoTypeController],
  providers: [CargoTypeService],
  exports: [CargoTypeService],
})
export class CargoTypeModule {}
