import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CargoSupplierModel,
  CreateUpdateCargoSupplierModel, UpdateCargoSupplierModel,
} from './models/cargoSupplier.model';
import { LocationService } from '../location/location.service';
import { UserService } from '../user/user.service';
import { getRandomStr } from '../utils';

const cargoSupplierModelProjection = {
  _id: false,
  __v: false,
  user: false,
  publicAuthToken: false,
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
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Company phone number already registered`,
          errorCode: 'company_phone_number_already_used',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    newCargoSupplier.user = await this.userService.idToObjectId(
      newCargoSupplier.user,
    );

    const cargoSupplier = await this.cargoSupplierModel.create(
      newCargoSupplier,
    );
    cargoSupplier.publicAuthToken = getRandomStr(25, true);
    await cargoSupplier.validate();
    await cargoSupplier.save();
    return this.getCargoSupplier(cargoSupplier.id);
  }

  public async getCargoSupplier(
    id,
    noProjection = false,
  ): Promise<CargoSupplierModel> {
    const cargoSupplier = await this.cargoSupplierModel
      .findOne({ id: id }, noProjection ? null : cargoSupplierModelProjection)
      .populate(this.populateFields)
      .exec();
    if (!cargoSupplier) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cargo Supplier Not Found',
          errorCode: 'cargo_supplier_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return cargoSupplier;
  }

  public async getCargoSupplierUser(id): Promise<CargoSupplierModel> {
    const cargoSupplier = await this.cargoSupplierModel
      .findOne({ id: id })
      .populate([
        {
          path: 'user',
          select: 'id name surname phoneNumber',
        },
      ])
      .select('user -_id')
      .exec();
    if (!cargoSupplier) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cargo Supplier Not Found',
          errorCode: 'cargo_supplier_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
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
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cargo Supplier Not Found',
          errorCode: 'cargo_supplier_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return cargoSupplier;
  }

  public async getCargoSupplierByFilter(filter): Promise<CargoSupplierModel> {
    const cargoSupplier = await this.cargoSupplierModel.findOne(filter).exec();
    if (!cargoSupplier) {
      return null;
    }
    return cargoSupplier;
  }

  public async updateCargoSupplier(
    id: string,
    updateParams: CreateUpdateCargoSupplierModel | UpdateCargoSupplierModel,
  ): Promise<CargoSupplierModel> {
    const cargoSupplier = await this.cargoSupplierModel
      .findOneAndUpdate({ id: id }, updateParams)
      .exec();
    if (!cargoSupplier) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cargo Supplier Not Found',
          errorCode: 'cargo_supplier_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
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
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cargo Supplier Not Found',
          errorCode: 'cargo_supplier_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.getCargoSupplier(cargoSupplier.id);
  }

  public async idToObjectId(id: string): Promise<Types.ObjectId> {
    if (!id) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cargo Supplier id should be specified',
          errorCode: 'cargo_supplier_id_not_specified',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const cargoSupplier = await this.cargoSupplierModel
      .findOne({ id: id })
      .exec();
    if (!cargoSupplier) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cargo Supplier Not Found',
          errorCode: 'cargo_supplier_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return cargoSupplier._id;
  }

  public async validateIsOwner(id: string, userId: string) {
    const userObjectId = await this.userService.idToObjectId(userId);
    const cargoSupplier = await this.cargoSupplierModel
      .findOne({ id: id, user: userObjectId })
      .exec();
    if (!cargoSupplier) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message:
            'Cargo Supplier is not found or is not owner of the resource',
          errorCode: 'cargo_supplier_not_found_or_not_owner',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.getCargoSupplier(cargoSupplier.id, true);
  }
}
