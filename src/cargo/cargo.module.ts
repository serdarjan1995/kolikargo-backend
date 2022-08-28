import { Module } from '@nestjs/common';
import { CargoService } from './cargo.service';
import { CargoController } from './cargo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CargoSupplierModule } from '../cargo-supplier/cargo-supplier.module';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';
import { CargoSchema } from './schemas/cargo.schema';
import { UserAddressModule } from '../user-address/user-address.module';
import { CargoPricingModule } from '../cargo-pricing/cargo-pricing.module';
import { CouponModule } from '../coupon/coupon.module';
import { SmsProviderService } from './smsProvider.service';
import { CargoCreatedListener } from './listeners/cargo-created.listener';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Cargo',
        schema: CargoSchema,
      },
    ]),
    CargoSupplierModule,
    UserAddressModule,
    CargoPricingModule,
    LocationModule,
    UserModule,
    CouponModule,
  ],
  providers: [CargoService, SmsProviderService, CargoCreatedListener],
  controllers: [CargoController],
  exports: [CargoService, SmsProviderService],
})
export class CargoModule {}