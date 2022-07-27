import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateUserAddressModel,
  UserAddressModel,
} from './models/userAddress.model';
import { UserService } from '../user/user.service';

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

    const userAddress = await this.userAddressModel.create(newUserAddress);
    await userAddress.validate();
    await userAddress.save();
    return this.getUserAddress(userAddress.id, userId);
  }

  public async getUserAddress(id, userId): Promise<UserAddressModel> {
    const userAddress = await this.userAddressModel
      .findOne(
        { id: id, user: await this.userService.idToObjectId(userId) },
        userAddressModelProjection,
      )
      .exec();
    if (!userAddress) {
      throw new HttpException('User Address Not Found', HttpStatus.NOT_FOUND);
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
      throw new HttpException('User Address Not Found', HttpStatus.NOT_FOUND);
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
      throw new HttpException('User Address Not Found', HttpStatus.NOT_FOUND);
    }
    return userAddress;
  }
}
