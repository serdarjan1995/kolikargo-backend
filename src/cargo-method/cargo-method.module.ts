import { Module } from '@nestjs/common';
import { CargoMethodController } from './cargo-method.controller';
import { CargoMethodService } from './cargo-method.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CargoMethodSchema } from './schemas/cargoMethod.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'CargoMethod',
        schema: CargoMethodSchema,
      },
    ]),
  ],
  controllers: [CargoMethodController],
  providers: [CargoMethodService],
  exports: [CargoMethodService],
})
export class CargoMethodModule {}
