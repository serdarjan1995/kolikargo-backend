import { Module } from '@nestjs/common';
import {
  CargoSupplierAuthController,
  CargoSupplierController,
} from './cargo-supplier.controller';
import { CargoSupplierService } from './cargo-supplier.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CargoSupplierSchema } from './schemas/cargoSupplier.schema';
import { LocationModule } from '../location/location.module';
import { UserModule } from '../user/user.module';
import { CargoPricingModule } from '../cargo-pricing/cargo-pricing.module';
import { NewCargoSupplierReviewListener } from './listeners/new-cargo-supplier-review.listener';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
import { SupplierLocalStrategy } from './supplier-local.strategy';
import { SupplierJwtStrategy } from './supplier-jwt.strategy';
import { SupplierAuthCodeSchema } from './schemas/asupplierAuthCode.schema';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'CargoSupplier',
        schema: CargoSupplierSchema,
      },
      {
        name: 'SupplierAuthCode',
        schema: SupplierAuthCodeSchema,
      },
    ]),
    LocationModule,
    UserModule,
    CargoPricingModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '180 days' },
    }),
  ],
  controllers: [CargoSupplierController, CargoSupplierAuthController],
  providers: [
    CargoSupplierService,
    NewCargoSupplierReviewListener,
    SupplierLocalStrategy,
    SupplierJwtStrategy,
  ],
  exports: [CargoSupplierService],
})
export class CargoSupplierModule {}
