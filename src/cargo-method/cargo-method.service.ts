import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CargoMethodModel,
  CreateCargoMethodModel,
} from './models/cargoMethod.model';

const cargoMethodModelProjection = {
  _id: false,
  __v: false,
};

@Injectable()
export class CargoMethodService {
  constructor(
    @InjectModel('CargoMethod')
    private readonly cargoMethodModel: Model<CargoMethodModel>,
  ) {}

  public async getCargoMethods(filter: object): Promise<CargoMethodModel[]> {
    return await this.cargoMethodModel
      .find(filter, cargoMethodModelProjection)
      .exec();
  }

  public async createCargoMethod(
    newCargoMethod: CreateCargoMethodModel,
  ): Promise<CargoMethodModel> {
    const existingCargoMethod = await this.getCargoMethods({
      name: {
        $regex: new RegExp('^' + newCargoMethod.name, 'i'),
      },
    });

    if (existingCargoMethod.length) {
      throw new HttpException(
        'Cargo method already exists, please check name',
        HttpStatus.BAD_REQUEST,
      );
    }

    const cargoMethod = await this.cargoMethodModel.create(newCargoMethod);
    await cargoMethod.validate();
    await cargoMethod.save();
    return this.getCargoMethod(cargoMethod.id);
  }

  public async getCargoMethod(id): Promise<CargoMethodModel> {
    const cargoMethod = await this.cargoMethodModel
      .findOne({ id: id }, cargoMethodModelProjection)
      .exec();
    if (!cargoMethod) {
      throw new HttpException('Cargo Method Not Found', HttpStatus.NOT_FOUND);
    }
    return cargoMethod;
  }

  public async updateCargoMethod(
    id: string,
    updateParams: any,
  ): Promise<CargoMethodModel> {
    delete updateParams.id;
    const cargoMethod = await this.cargoMethodModel
      .findOneAndUpdate({ id: id }, updateParams)
      .exec();
    if (!cargoMethod) {
      throw new HttpException('Cargo Method Not Found', HttpStatus.NOT_FOUND);
    }
    return this.getCargoMethod(cargoMethod.id);
  }

  public async deleteCargoMethod(id): Promise<any> {
    const cargoMethod = await this.cargoMethodModel.deleteOne({ id: id });
    if (!cargoMethod.deletedCount) {
      throw new HttpException('Cargo Method Not Found', HttpStatus.NOT_FOUND);
    }
    return cargoMethod;
  }

  public async idToObjectId(id: string): Promise<Types.ObjectId> {
    if (!id) {
      throw new HttpException(
        `CargoMethod id should be specified`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const cargoMethod = await this.cargoMethodModel.findOne({ id: id }).exec();
    if (!cargoMethod) {
      throw new HttpException(
        `CargoMethod ${id} Not Found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return cargoMethod._id;
  }
}
