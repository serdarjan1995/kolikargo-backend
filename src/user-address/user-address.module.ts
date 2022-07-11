import { Module } from '@nestjs/common';
import { UserAddressController } from './user-address.controller';
import { UserAddressService } from './user-address.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAddressSchema } from './schemas/userAddress.schema';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'UserAddress',
        schema: UserAddressSchema,
      },
    ]),
    UserModule,
  ],
  controllers: [UserAddressController],
  providers: [UserAddressService],
  exports: [UserAddressService],
})
export class UserAddressModule {}
