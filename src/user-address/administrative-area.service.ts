import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AdministrativeAreaModel,
  CATEGORY,
} from './models/administrativeArea.model';

const administrativeAreaProjection = {
  _id: false,
  __v: false,
  child: false,
  childCategory: false,
  parent: false,
  parentCategory: false,
};

@Injectable()
export class AdministrativeAreaService {
  constructor(
    @InjectModel('AdministrativeArea')
    private readonly administrativeAreaModel: Model<AdministrativeAreaModel>,
  ) {}

  public async listCountries(): Promise<AdministrativeAreaModel[]> {
    return await this.administrativeAreaModel
      .find({ category: CATEGORY.COUNTRY }, administrativeAreaProjection)
      .exec();
  }

  public async listProvinces(
    country: string,
  ): Promise<AdministrativeAreaModel[]> {
    return await this.administrativeAreaModel
      .find(
        { country: country, category: CATEGORY.PROVINCE },
        administrativeAreaProjection,
      )
      .exec();
  }

  public async listCities(
    country: string,
    province: string,
  ): Promise<AdministrativeAreaModel[]> {
    return await this.administrativeAreaModel
      .find(
        {
          country: country,
          parent: province,
          parentCategory: CATEGORY.PROVINCE,
          category: CATEGORY.CITY,
        },
        administrativeAreaProjection,
      )
      .exec();
  }

  public async listDistricts(
    country: string,
    city: string,
  ): Promise<AdministrativeAreaModel[]> {
    return await this.administrativeAreaModel
      .find(
        {
          country: country,
          parent: city,
          parentCategory: CATEGORY.CITY,
          category: CATEGORY.DISTRICT,
        },
        administrativeAreaProjection,
      )
      .exec();
  }

  public async findOne(filter: object): Promise<AdministrativeAreaModel> {
    return await this.administrativeAreaModel
      .findOne(filter, administrativeAreaProjection)
      .exec();
  }

  public async addNew(newAdministrativeArea: AdministrativeAreaModel) {
    const userAddress = await this.administrativeAreaModel.create(
      newAdministrativeArea,
    );
    await userAddress.validate();
    await userAddress.save();
    return userAddress;
  }
}
