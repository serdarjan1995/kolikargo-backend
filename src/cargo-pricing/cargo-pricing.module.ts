import { Module } from '@nestjs/common';
import { CargoPricingController } from './cargo-pricing.controller';
import { CargoPricingService } from './cargo-pricing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CargoSupplierSchema } from '../cargo-supplier/schemas/cargoSupplier.schema';
import { CargoSupplierModule } from '../cargo-supplier/cargo-supplier.module';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';
import { CargoPricingSchema } from './schemas/cargoPricing.schema';
import { CargoMethodService } from '../cargo-method/cargo-method.service';
import { CargoTypeService } from '../cargo-type/cargo-type.service';
import { CargoMethodSchema } from '../cargo-method/schemas/cargoMethod.schema';
import { CargoTypeSchema } from '../cargo-type/schemas/cargoType.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'CargoPricing',
        schema: CargoPricingSchema,
      },
      {
        name: 'CargoSupplier',
        schema: CargoSupplierSchema,
      },
      {
        name: 'CargoMethod',
        schema: CargoMethodSchema,
      },
      {
        name: 'CargoType',
        schema: CargoTypeSchema,
      },
    ]),
    CargoSupplierModule,
    UserModule,
    LocationModule,
  ],
  controllers: [CargoPricingController],
  providers: [
    CargoSupplierService,
    CargoMethodService,
    CargoTypeService,
    CargoPricingService,
  ],
  exports: [CargoPricingService],
})
export class CargoPricingModule {}
