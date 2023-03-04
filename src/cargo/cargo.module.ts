import { forwardRef, Module } from '@nestjs/common';
import { CargoService } from './cargo.service';
import {
  CargoController,
  CargoPublicTrackingController,
  CargoStatusChangeActionController,
  CargoTypeController,
  SupplierCargoController,
} from './cargo.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CargoSupplierModule } from '../cargo-supplier/cargo-supplier.module';
import { UserModule } from '../user/user.module';
import { LocationModule } from '../location/location.module';
import { Cargo, CargoSchema } from './schemas/cargo.schema';
import { UserAddressModule } from '../user-address/user-address.module';
import { CargoPricingModule } from '../cargo-pricing/cargo-pricing.module';
import { CouponModule } from '../coupon/coupon.module';
import { SmsProviderService } from './smsProvider.service';
import { CargoCreatedListener } from './listeners/cargo-created.listener';
import { CargoStatusUpdatedListener } from './listeners/cargo-status-updated.listener';
import {
  CargoTracking,
  CargoTrackingSchema,
} from './schemas/cargoTracking.schema';
import { CargoType, CargoTypeSchema } from './schemas/cargoType.schema';
import {
  CargoStatusChangeAction,
  CargoStatusChangeActionSchema,
} from './schemas/CargoStatusChangeAction.schema';
import {
  CargoSupplierPayment,
  CargoSupplierPaymentSchema,
} from './schemas/cargoSupplierPayment.schema';
import { CargoCommissionService } from './cargoCommission.service';
import { CargoApplyCommissionsListener } from './listeners/cargo-apply-commissions.listener';
import { CargoCommissionPaymentTasksService } from './cargoCommissionPayment.tasks.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Cargo.name,
        schema: CargoSchema,
      },
      {
        name: CargoTracking.name,
        schema: CargoTrackingSchema,
      },
      {
        name: CargoType.name,
        schema: CargoTypeSchema,
      },
      {
        name: CargoStatusChangeAction.name,
        schema: CargoStatusChangeActionSchema,
      },
      {
        name: CargoSupplierPayment.name,
        schema: CargoSupplierPaymentSchema,
      },
    ]),
    CargoSupplierModule,
    UserAddressModule,
    CargoPricingModule,
    LocationModule,
    UserModule,
    forwardRef(() => CouponModule),
  ],
  providers: [
    CargoService,
    CargoCommissionService,
    SmsProviderService,
    CargoCreatedListener,
    CargoStatusUpdatedListener,
    CargoApplyCommissionsListener,
    CargoCommissionPaymentTasksService,
  ],
  controllers: [
    CargoController,
    CargoPublicTrackingController,
    CargoTypeController,
    SupplierCargoController,
    CargoStatusChangeActionController,
  ],
  exports: [CargoService, CargoCommissionService, SmsProviderService],
})
export class CargoModule {}
