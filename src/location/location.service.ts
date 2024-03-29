import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateLocationModel, LocationModel } from './models/location.model';

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
    newLocation: CreateLocationModel,
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
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Location Not Found',
          errorCode: 'location_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
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
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Location Not Found',
          errorCode: 'location_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.getLocation(location.id);
  }

  public async idToObjectId(id: string): Promise<Types.ObjectId> {
    const location = await this.locationModel.findOne({ id: id }).exec();
    if (!location) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Location ${id} Not Found`,
          errorCode: 'location_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return location._id;
  }

  public async populateLocations(locationIds) {
    const locations: Types.ObjectId[] = [];
    for (const locationId of locationIds) {
      const location = await this.idToObjectId(locationId);
      locations.push(location);
    }
    return locations;
  }
}
