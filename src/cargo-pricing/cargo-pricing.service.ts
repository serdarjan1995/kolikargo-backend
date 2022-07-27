import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';
import {
  CargoPricingModel,
  CreateCargoPricingModel,
} from './models/cargoPricing.model';
import { CargoMethodService } from '../cargo-method/cargo-method.service';
import { CargoTypeService } from '../cargo-type/cargo-type.service';

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
    private readonly cargoMethodService: CargoMethodService,
    private readonly cargoTypeService: CargoTypeService,
  ) {}

  public populateFields = [
    {
      path: 'cargoMethod',
      select: 'id name description',
    },
    {
      path: 'cargoType',
      select: 'id name description',
    },
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
    const objectIds = await this.checkExistingCargoPricing(
      newCargoPricing.supplier,
      newCargoPricing.cargoMethod,
      newCargoPricing.cargoType,
    );

    newCargoPricing.supplier = objectIds.cargoMethod;
    newCargoPricing.cargoType = objectIds.cargoType;
    newCargoPricing.cargoMethod = objectIds.supplier;

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

  public async checkExistingCargoPricing(
    supplierId: string,
    cargoMethodId: string,
    cargoTypeId: string,
    exceptId: any = null,
  ) {
    const cargoSupplierObjectId = await this.cargoSupplierService.idToObjectId(
      supplierId,
    );
    const cargoMethodObjectId = await this.cargoMethodService.idToObjectId(
      cargoMethodId,
    );
    const cargoTypeObjectId = await this.cargoTypeService.idToObjectId(
      cargoTypeId,
    );

    const filter = {
      cargoMethod: cargoMethodObjectId,
      cargoType: cargoTypeObjectId,
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
        `The pricing for cargo method ${cargoMethodId} with ${cargoTypeId} already exists, please check entries`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return filter;
  }

  public async updateCargoPricing(
    id: string,
    updateParams: CreateCargoPricingModel,
  ): Promise<CargoPricingModel> {
    const objectIds = await this.checkExistingCargoPricing(
      updateParams.supplier,
      updateParams.cargoMethod,
      updateParams.cargoType,
      id,
    );

    updateParams.cargoMethod = objectIds.cargoMethod;
    updateParams.cargoType = objectIds.cargoType;
    updateParams.supplier = objectIds.supplier;

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
