import { Module } from '@nestjs/common';
import { CargoSupplierController } from './cargo-supplier.controller';
import { CargoSupplierService } from './cargo-supplier.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CargoSupplierSchema } from './schemas/cargoSupplier.schema';
import { LocationModule } from '../location/location.module';
import { UserModule } from '../user/user.module';
import { CargoPricingModule } from '../cargo-pricing/cargo-pricing.module';
import { NewCargoSupplierReviewListener } from './listeners/new-cargo-supplier-review.listener';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'CargoSupplier',
        schema: CargoSupplierSchema,
      },
    ]),
    LocationModule,
    UserModule,
    CargoPricingModule,
  ],
  controllers: [CargoSupplierController],
  providers: [CargoSupplierService, NewCargoSupplierReviewListener],
  exports: [CargoSupplierService],
})
export class CargoSupplierModule {}
