import { Module } from '@nestjs/common';
import { UserAddressController } from './user-address.controller';
import { UserAddressService } from './user-address.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAddressSchema } from './schemas/userAddress.schema';
import { UserModule } from '../user/user.module';
import { AdministrativeAreaController } from './administrative-area.controller';
import { AdministrativeAreaService } from './administrative-area.service';
import { AdministrativeAreaSchema } from './schemas/administrativeArea.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'UserAddress',
        schema: UserAddressSchema,
      },
      {
        name: 'AdministrativeArea',
        schema: AdministrativeAreaSchema,
      },
    ]),
    UserModule,
  ],
  controllers: [UserAddressController, AdministrativeAreaController],
  providers: [UserAddressService, AdministrativeAreaService],
  exports: [UserAddressService, AdministrativeAreaService],
})
export class UserAddressModule {}
