import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CargoSupplierModel } from './models/cargoSupplier.model';
import { LocationService } from '../location/location.service';
import { UserService } from '../user/user.service';

const cargoSupplierModelProjection = {
  _id: false,
  __v: false,
  user: false,
};

@Injectable()
export class CargoSupplierService {
  constructor(
    @InjectModel('CargoSupplier')
    private readonly cargoSupplierModel: Model<CargoSupplierModel>,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
  ) {}

  public populateFields = [
    {
      path: 'serviceSourceLocations',
      select: 'id city country address',
    },
    {
      path: 'serviceDestinationLocations',
      select: 'id city country address',
    },
  ];

  public async getCargoSuppliers(
    filter: object,
  ): Promise<CargoSupplierModel[]> {
    return await this.cargoSupplierModel
      .find(filter, cargoSupplierModelProjection)
      .populate(this.populateFields)
      .exec();
  }

  public async createCargoSupplier(
    newCargoSupplier: CargoSupplierModel,
  ): Promise<CargoSupplierModel> {
    const existingCargoSupplier = await this.getCargoSuppliers({
      phoneNumber: newCargoSupplier.phoneNumber,
    });
    if (existingCargoSupplier.length) {
      throw new HttpException('Company phone number already registered', 400);
    }

    // find all locations and replace object ids
    newCargoSupplier.serviceSourceLocations = await this.populateLocations(
      newCargoSupplier.serviceSourceLocations,
    );
    newCargoSupplier.serviceDestinationLocations = await this.populateLocations(
      newCargoSupplier.serviceDestinationLocations,
    );

    newCargoSupplier.user = await this.userService.idToObjectId(
      newCargoSupplier.user,
    );

    const cargoSupplier = await this.cargoSupplierModel.create(
      newCargoSupplier,
    );
    await cargoSupplier.validate();
    await cargoSupplier.save();
    return this.getCargoSupplier(cargoSupplier.id);
  }

  public async getCargoSupplier(id): Promise<CargoSupplierModel> {
    const cargoSupplier = await this.cargoSupplierModel
      .findOne({ id: id }, cargoSupplierModelProjection)
      .populate(this.populateFields)
      .exec();
    if (!cargoSupplier) {
      throw new HttpException('Not Found', 404);
    }
    return cargoSupplier;
  }

  public async updateCargoSupplier(
    id: string,
    updateParams: any,
  ): Promise<CargoSupplierModel> {
    delete updateParams.id;
    // find all locations and replace object ids
    updateParams.serviceSourceLocations = await this.populateLocations(
      updateParams.serviceSourceLocations,
    );
    updateParams.serviceDestinationLocations = await this.populateLocations(
      updateParams.serviceDestinationLocations,
    );

    const cargoSupplier = await this.cargoSupplierModel
      .findOneAndUpdate({ id: id }, updateParams)
      .exec();
    if (!cargoSupplier) {
      throw new HttpException('Not Found', 404);
    }
    return this.getCargoSupplier(cargoSupplier.id);
  }

  public async populateLocations(locationIds) {
    const locations: Types.ObjectId[] = [];
    for (const locationId of locationIds) {
      const location = await this.locationService.idToObjectId(locationId);
      locations.push(location);
    }
    return locations;
  }

  public async idToObjectId(id: string): Promise<Types.ObjectId> {
    if (!id) {
      throw new HttpException(`CargoSupplier id should be specified`, 400);
    }
    const cargoSupplier = await this.cargoSupplierModel
      .findOne({ id: id })
      .exec();
    if (!cargoSupplier) {
      throw new HttpException(`CargoSupplier ${id} Not Found`, 404);
    }
    return cargoSupplier._id;
  }
}
