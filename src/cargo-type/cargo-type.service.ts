import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CargoTypeModel, CreateCargoTypeModel } from './models/cargoType.model';

const cargoTypeModelProjection = {
  _id: false,
  __v: false,
};

@Injectable()
export class CargoTypeService {
  constructor(
    @InjectModel('CargoType')
    private readonly cargoTypeModel: Model<CargoTypeModel>,
  ) {}

  public async getCargoTypes(filter: object): Promise<CargoTypeModel[]> {
    return await this.cargoTypeModel
      .find(filter, cargoTypeModelProjection)
      .exec();
  }

  public async createCargoType(
    newCargoType: CreateCargoTypeModel,
  ): Promise<CargoTypeModel> {
    const existingCargoType = await this.getCargoTypes({
      name: {
        $regex: new RegExp('^' + newCargoType.name, 'i'),
      },
    });

    if (existingCargoType.length) {
      throw new HttpException(
        'Cargo type already exists, please check name',
        HttpStatus.BAD_REQUEST,
      );
    }

    const cargoType = await this.cargoTypeModel.create(newCargoType);
    await cargoType.validate();
    await cargoType.save();
    return this.getCargoType(cargoType.id);
  }

  public async getCargoType(id): Promise<CargoTypeModel> {
    const cargoType = await this.cargoTypeModel
      .findOne({ id: id }, cargoTypeModelProjection)
      .exec();
    if (!cargoType) {
      throw new HttpException('Cargo Type Not Found', HttpStatus.NOT_FOUND);
    }
    return cargoType;
  }

  public async updateCargoType(
    id: string,
    updateParams: any,
  ): Promise<CargoTypeModel> {
    delete updateParams.id;
    const cargoType = await this.cargoTypeModel
      .findOneAndUpdate({ id: id }, updateParams)
      .exec();
    if (!cargoType) {
      throw new HttpException('Cargo Type Not Found', HttpStatus.NOT_FOUND);
    }
    return this.getCargoType(cargoType.id);
  }

  public async deleteCargoType(id): Promise<any> {
    const cargoType = await this.cargoTypeModel.deleteOne({ id: id });
    if (!cargoType.deletedCount) {
      throw new HttpException('Cargo Type Not Found', HttpStatus.NOT_FOUND);
    }
    return cargoType;
  }

  public async idToObjectId(id: string): Promise<Types.ObjectId> {
    if (!id) {
      throw new HttpException(
        `CargoType id should be specified`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const cargoType = await this.cargoTypeModel.findOne({ id: id }).exec();
    if (!cargoType) {
      throw new HttpException(
        `CargoType ${id} Not Found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return cargoType._id;
  }
}
