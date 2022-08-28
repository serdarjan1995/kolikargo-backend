import { forwardRef, Module } from '@nestjs/common';
import { CargoPricingController } from './cargo-pricing.controller';
import { CargoPricingService } from './cargo-pricing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CargoSupplierModule } from '../cargo-supplier/cargo-supplier.module';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';
import { CargoPricingSchema } from './schemas/cargoPricing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'CargoPricing',
        schema: CargoPricingSchema,
      },
    ]),
    forwardRef(() => CargoSupplierModule),
    UserModule,
    LocationModule,
  ],
  controllers: [CargoPricingController],
  providers: [CargoPricingService],
  exports: [CargoPricingService],
})
export class CargoPricingModule {}
