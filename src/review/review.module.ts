import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CargoSupplierModule } from '../cargo-supplier/cargo-supplier.module';
import { UserModule } from '../user/user.module';
import { CargoModule } from '../cargo/cargo.module';
import { ReviewSchema } from './schemas/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Review',
        schema: ReviewSchema,
      },
    ]),
    UserModule,
    CargoSupplierModule,
    CargoModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
