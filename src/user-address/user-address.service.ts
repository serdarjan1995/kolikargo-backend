import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AddressType,
  CreateUserAddressModel,
  UserAddressModel,
} from './models/userAddress.model';
import { UserService } from '../user/user.service';
import { AdministrativeAreaService } from './administrative-area.service';
import { CATEGORY } from './models/administrativeArea.model';

const userAddressModelProjection = {
  _id: false,
  __v: false,
  user: false,
};

@Injectable()
export class UserAddressService {
  constructor(
    @InjectModel('UserAddress')
    private readonly userAddressModel: Model<UserAddressModel>,
    private readonly userService: UserService,
    private readonly administrativeAreaService: AdministrativeAreaService,
  ) {}

  public async listUserAddresses(
    filter: object,
    userId: string,
  ): Promise<UserAddressModel[]> {
    filter['user'] = await this.userService.idToObjectId(userId);
    return await this.userAddressModel
      .find(filter, userAddressModelProjection)
      .exec();
  }

  public async createUserAddress(
    newUserAddress: CreateUserAddressModel,
    userId: string,
  ): Promise<UserAddressModel> {
    const user = await this.userService.idToObjectId(userId);
    newUserAddress.user = user;
    if (newUserAddress?.isDefault) {
      // unselect default flag from existing addresses
      await this.removeDefaultFlagsFromUserAddress(newUserAddress.type, user);
    }

    await this.validateAddressAdministrativeArea(newUserAddress);

    const userAddress = await this.userAddressModel.create(newUserAddress);
    await userAddress.validate();
    await userAddress.save();
    return this.getUserAddress(userAddress.id, userId);
  }

  public async validateAddressAdministrativeArea(userAddress) {
    // validate country
    const country = await this.administrativeAreaService.findOne({
      category: CATEGORY.COUNTRY,
      country: userAddress.country,
    });
    if (!country) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Country ${userAddress.country} Not Found`,
          errorCode: 'country_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // validate province
    const province = await this.administrativeAreaService.findOne({
      category: CATEGORY.PROVINCE,
      name: userAddress.province,
      parent: userAddress.country,
      parentCategory: CATEGORY.COUNTRY,
    });
    if (!province) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Province ${userAddress.province} Not Found`,
          errorCode: 'province_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (userAddress.type == AddressType.SENDER) {
      // validate city
      const city = await this.administrativeAreaService.findOne({
        category: CATEGORY.CITY,
        name: userAddress.city,
        parent: userAddress.province,
        parentCategory: CATEGORY.PROVINCE,
      });
      if (!city) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `City ${userAddress.city} Not Found`,
            errorCode: 'city_not_found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // validate district
      const district = await this.administrativeAreaService.findOne({
        category: CATEGORY.DISTRICT,
        name: userAddress.district,
        parent: userAddress.city,
        parentCategory: CATEGORY.CITY,
      });
      if (!district) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: `District ${userAddress.district} Not Found`,
            errorCode: 'district_not_found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }
  }

  public async getUserAddress(
    id,
    userId,
    noProjection = false,
  ): Promise<UserAddressModel> {
    const filter = {
      id: id,
      user: await this.userService.idToObjectId(userId),
    };
    const projection = noProjection ? null : userAddressModelProjection;

    const userAddress = await this.userAddressModel
      .findOne(filter, projection)
      .exec();
    if (!userAddress) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User Address Not Found`,
          errorCode: 'user_address_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return userAddress;
  }

  public async updateUserAddress(
    id: string,
    userId: string,
    updateParams: any,
  ): Promise<UserAddressModel> {
    delete updateParams.user;
    delete updateParams.id;
    const user = await this.userService.idToObjectId(userId);
    if (updateParams.isDefault) {
      // remove isDefault flag
      await this.removeDefaultFlagsFromUserAddress(updateParams.type, user);
    }
    delete updateParams.type;

    const userAddress = await this.userAddressModel
      .findOneAndUpdate({ id: id, user: user }, updateParams)
      .exec();
    if (!userAddress) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User Address Not Found`,
          errorCode: 'user_address_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.getUserAddress(userAddress.id, userId);
  }

  public async removeDefaultFlagsFromUserAddress(
    type: string,
    user: Types.ObjectId,
  ): Promise<any> {
    return await this.userAddressModel
      .updateMany({ type, user }, { isDefault: false })
      .exec();
  }

  public async deleteUserAddress(id): Promise<any> {
    const userAddress = await this.userAddressModel.deleteOne({ id: id });
    if (!userAddress.deletedCount) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User Address Not Found`,
          errorCode: 'user_address_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return userAddress;
  }
}
