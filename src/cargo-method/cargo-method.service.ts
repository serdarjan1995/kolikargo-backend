import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CargoMethodModel, CreateCargoMethodModel } from './models/cargoMethod.model';

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
        400,
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
      throw new HttpException('Not Found', 404);
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
      throw new HttpException('Not Found', 404);
    }
    return this.getCargoMethod(cargoMethod.id);
  }

  public async deleteCargoMethod(id): Promise<any> {
    const cargoMethod = await this.cargoMethodModel.deleteOne({ id: id });
    if (!cargoMethod.deletedCount) {
      throw new HttpException('Not Found', 404);
    }
    return cargoMethod;
  }
}
