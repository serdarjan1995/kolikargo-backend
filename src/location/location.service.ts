import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LocationModel } from './models/location.model';

const locationProjection = {
  __v: false,
  _id: false,
};

@Injectable()
export class LocationService {
  constructor(
    @InjectModel('Location')
    private readonly locationModel: Model<LocationModel>,
  ) {}

  public async getLocations(filter: object): Promise<LocationModel[]> {
    return await this.locationModel.find(filter, locationProjection).exec();
  }

  public async createLocation(
    newLocation: LocationModel,
  ): Promise<LocationModel> {
    const location = await this.locationModel.create(newLocation);
    await location.validate();
    await location.save();
    return await this.getLocation(location.id);
  }

  public async getLocation(id): Promise<LocationModel> {
    const location = await this.locationModel
      .findOne({ id: id }, locationProjection)
      .exec();
    if (!location) {
      throw new HttpException('Not Found', 404);
    }
    return location;
  }

  public async updateLocation(
    id: string,
    updateParams: any,
  ): Promise<LocationModel> {
    delete updateParams.id;
    const location = await this.locationModel
      .findOneAndUpdate({ id: id }, updateParams)
      .exec();
    if (!location) {
      throw new HttpException('Not Found', 404);
    }
    return this.getLocation(location.id);
  }

  public async idToObjectId(id: string): Promise<Types.ObjectId> {
    const location = await this.locationModel.findOne({ id: id }).exec();
    if (!location) {
      throw new HttpException(`Location ${id} Not Found`, 404);
    }
    return location._id;
  }
}
