import { Module } from '@nestjs/common';
import { CargoSupplierController } from './cargo-supplier.controller';
import { CargoSupplierService } from './cargo-supplier.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CargoSupplierSchema } from './schemas/cargoSupplier.schema';
import { LocationService } from '../location/location.service';
import { LocationModule } from '../location/location.module';
import { LocationSchema } from '../location/schemas/location.schema';
import { UserModule } from '../user/user.module';
import { CargoPricingService } from '../cargo-pricing/cargo-pricing.service';
import { CargoPricingSchema } from '../cargo-pricing/schemas/cargoPricing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'CargoSupplier',
        schema: CargoSupplierSchema,
      },
      {
        name: 'Location',
        schema: LocationSchema,
      },
      {
        name: 'CargoPricing',
        schema: CargoPricingSchema,
      },
    ]),
    LocationModule,
    UserModule,
  ],
  controllers: [CargoSupplierController],
  providers: [LocationService, CargoPricingService, CargoSupplierService],
  exports: [CargoSupplierService],
})
export class CargoSupplierModule {}
