import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CouponSchema } from './schemas/coupon.schema';
import { CargoSupplierSchema } from '../cargo-supplier/schemas/cargoSupplier.schema';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';
import { CargoSupplierModule } from '../cargo-supplier/cargo-supplier.module';
import { LocationService } from '../location/location.service';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { LocationSchema } from '../location/schemas/location.schema';
import { UserSchema } from '../user/schemas/user.schema';
import { LocationModule } from '../location/location.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Coupon',
        schema: CouponSchema,
      },
      {
        name: 'CargoSupplier',
        schema: CargoSupplierSchema,
      },
      {
        name: 'Location',
        schema: LocationSchema,
      },
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
    CargoSupplierModule,
    UserModule,
    LocationModule,
  ],
  controllers: [CouponController],
  providers: [CargoSupplierService, CouponService],
  exports: [CouponService],
})
export class CouponModule {}
