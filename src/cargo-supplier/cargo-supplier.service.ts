import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CargoSupplierModel,
  CreateUpdateCargoSupplierModel,
} from './models/cargoSupplier.model';
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
    newCargoSupplier: CreateUpdateCargoSupplierModel,
  ): Promise<CargoSupplierModel> {
    const existingCargoSupplier = await this.getCargoSuppliers({
      phoneNumber: newCargoSupplier.phoneNumber,
    });
    if (existingCargoSupplier.length) {
      throw new HttpException(
        'Company phone number already registered',
        HttpStatus.BAD_REQUEST,
      );
    }

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
      throw new HttpException('Cargo Supplier Not Found', HttpStatus.NOT_FOUND);
    }
    return cargoSupplier;
  }

  public async getCargoSupplierByUser(id, userId): Promise<CargoSupplierModel> {
    const user = await this.userService.idToObjectId(userId);
    const cargoSupplier = await this.cargoSupplierModel
      .findOne({ id: id, user: user._id }, cargoSupplierModelProjection)
      .populate(this.populateFields)
      .exec();
    if (!cargoSupplier) {
      throw new HttpException('Cargo Supplier Not Found', HttpStatus.NOT_FOUND);
    }
    return cargoSupplier;
  }

  public async updateCargoSupplier(
    id: string,
    updateParams: CreateUpdateCargoSupplierModel,
  ): Promise<CargoSupplierModel> {
    const cargoSupplier = await this.cargoSupplierModel
      .findOneAndUpdate({ id: id }, updateParams)
      .exec();
    if (!cargoSupplier) {
      throw new HttpException('Cargo Supplier Not Found', HttpStatus.NOT_FOUND);
    }
    return this.getCargoSupplier(cargoSupplier.id);
  }

  public async updateCargoSupplierByFilter(
    findFilter: object,
    updateParams: object,
  ): Promise<CargoSupplierModel> {
    const cargoSupplier = await this.cargoSupplierModel
      .findOneAndUpdate(findFilter, updateParams)
      .exec();
    if (!cargoSupplier) {
      throw new HttpException('Cargo Supplier Not Found', HttpStatus.NOT_FOUND);
    }
    return this.getCargoSupplier(cargoSupplier.id);
  }

  public async idToObjectId(id: string): Promise<Types.ObjectId> {
    if (!id) {
      throw new HttpException(
        `CargoSupplier id should be specified`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const cargoSupplier = await this.cargoSupplierModel
      .findOne({ id: id })
      .exec();
    if (!cargoSupplier) {
      throw new HttpException(
        `CargoSupplier ${id} Not Found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return cargoSupplier._id;
  }
}
