import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';
import {
  CargoPricingModel,
  CreateCargoPricingModel,
} from './models/cargoPricing.model';

const CargoPricingModelProjection = {
  _id: false,
  __v: false,
};

@Injectable()
export class CargoPricingService {
  constructor(
    @InjectModel('CargoPricing')
    private readonly cargoPricingModel: Model<CargoPricingModel>,
    private readonly cargoSupplierService: CargoSupplierService,
  ) {}

  public populateFields = [
    {
      path: 'supplier',
      select: 'id name description avatarUrl',
    },
  ];

  public async filterCargoPricing(
    filter: object,
  ): Promise<CargoPricingModel[]> {
    return await this.cargoPricingModel
      .find(filter, CargoPricingModelProjection)
      .populate(this.populateFields)
      .exec();
  }

  public async createCargoPricing(
    newCargoPricing: CreateCargoPricingModel,
  ): Promise<CargoPricingModel> {
    newCargoPricing.supplier = await this.checkExistingCargoPricing(
      newCargoPricing.supplier,
      newCargoPricing.cargoMethod,
      newCargoPricing.cargoType,
    );

    const cargoPricing = await this.cargoPricingModel.create(newCargoPricing);
    await cargoPricing.validate();
    await cargoPricing.save();
    return this.getCargoPricing(cargoPricing.id);
  }

  public async getCargoPricing(id): Promise<CargoPricingModel> {
    const cargoPricing = await this.cargoPricingModel
      .findOne({ id: id }, CargoPricingModelProjection)
      .populate(this.populateFields)
      .exec();
    if (!cargoPricing) {
      throw new HttpException('Cargo Pricing Not Found', HttpStatus.NOT_FOUND);
    }
    return cargoPricing;
  }

  /*** returns cargo-supplier ObjectId if valid ***/
  public async checkExistingCargoPricing(
    supplierId: string,
    cargoMethod: string,
    cargoType: string,
    exceptId: any = null,
  ) {
    const cargoSupplierObjectId = await this.cargoSupplierService.idToObjectId(
      supplierId,
    );

    const filter = {
      cargoMethod: cargoMethod,
      cargoType: cargoType,
      supplier: cargoSupplierObjectId,
    };

    if (exceptId) {
      filter['id'] = {
        $ne: exceptId,
      };
    }

    const existingCargoPricing = await this.filterCargoPricing(filter);

    if (existingCargoPricing.length) {
      throw new HttpException(
        `The pricing for cargo method ${cargoMethod} with ${cargoType} already exists, please check entries`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return cargoSupplierObjectId;
  }

  public async updateCargoPricing(
    id: string,
    updateParams: CreateCargoPricingModel,
  ): Promise<CargoPricingModel> {
    updateParams.supplier = await this.checkExistingCargoPricing(
      updateParams.supplier,
      updateParams.cargoMethod,
      updateParams.cargoType,
      id,
    );

    const cargoPricing = await this.cargoPricingModel
      .findOneAndUpdate({ id: id }, updateParams)
      .exec();
    if (!cargoPricing) {
      throw new HttpException('Cargo Pricing Not Found', HttpStatus.NOT_FOUND);
    }
    return this.getCargoPricing(cargoPricing.id);
  }

  public async deleteCargoPricing(id): Promise<any> {
    const cargoPricing = await this.cargoPricingModel.deleteOne({ id: id });
    if (!cargoPricing.deletedCount) {
      throw new HttpException('Cargo Pricing Not Found', HttpStatus.NOT_FOUND);
    }
    return cargoPricing;
  }
}
