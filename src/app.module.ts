import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { TwilioModule } from 'nestjs-twilio';
import { AuthModule } from './auth/auth.module';
import { CargoSupplierModule } from './cargo-supplier/cargo-supplier.module';
import { LocationModule } from './location/location.module';
import { UserAddressModule } from './user-address/user-address.module';
import { CouponModule } from './coupon/coupon.module';
import { CargoPricingModule } from './cargo-pricing/cargo-pricing.module';
import { CargoModule } from './cargo/cargo.module';
import { AppLoggerMiddleware } from './app.middleware';

const MONGODB_URL = process.env.MONGO_URL || 'localhost';
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;

const MONGO_CONNECTION_STR =
  process.env.MONGO_CONNECTION_STR ||
  `mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}:27017/kolikargo?serverSelectionTimeoutMS=2000&authSource=admin`;

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({ envFilePath: '.env' }),
    MongooseModule.forRoot(MONGO_CONNECTION_STR, { sslValidate: false }),
    TwilioModule.forRoot({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
    }),
    UserModule,
    AuthModule,
    CargoSupplierModule,
    LocationModule,
    UserAddressModule,
    CouponModule,
    CargoPricingModule,
    CargoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
