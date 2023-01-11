import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';
import {
  CargoPriceFieldModel,
  CargoPricingModel,
  CreateCargoPricingModel,
} from './models/cargoPricing.model';
import { LocationService } from '../location/location.service';

const CargoPricingModelProjection = {
  _id: false,
  __v: false,
  'prices.commission': false,
};

@Injectable()
export class CargoPricingService {
  constructor(
    @InjectModel('CargoPricing')
    private readonly cargoPricingModel: Model<CargoPricingModel>,
    private readonly cargoSupplierService: CargoSupplierService,
    private readonly locationService: LocationService,
  ) {}

  public populateFields = [
    {
      path: 'supplier',
      select: 'id name description avatarUrl',
    },
    {
      path: 'sourceLocations',
      select: 'id country city',
    },
    {
      path: 'destinationLocations',
      select: 'id country city',
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

  public async filterOneCargoPricing(
    filter: object,
    noProjection = false,
  ): Promise<CargoPricingModel> {
    const cargoPricing = await this.cargoPricingModel
      .findOne(filter, noProjection ? null : CargoPricingModelProjection)
      .populate(this.populateFields)
      .exec();
    if (!cargoPricing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cargo Pricing Not Found',
          errorCode: 'cargo_pricing_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return cargoPricing;
  }

  public async createCargoPricing(
    newCargoPricing: CreateCargoPricingModel,
  ): Promise<CargoPricingModel> {
    this.validatePriceFields(newCargoPricing.prices);

    newCargoPricing.sourceLocations =
      await this.locationService.populateLocations(
        newCargoPricing.sourceLocations,
      );

    newCargoPricing.destinationLocations =
      await this.locationService.populateLocations(
        newCargoPricing.destinationLocations,
      );

    newCargoPricing.supplier = await this.checkExistingCargoPricing(
      newCargoPricing.supplier,
      newCargoPricing.cargoMethod,
      newCargoPricing.sourceLocations,
      newCargoPricing.destinationLocations,
    );

    const cargoPricing = await this.cargoPricingModel.create(newCargoPricing);
    await cargoPricing.validate();
    await cargoPricing.save();

    await this.updateCargoSupplierServiceDetails(cargoPricing.supplier);
    return this.getCargoPricing(cargoPricing.id);
  }

  public async getCargoPricing(id): Promise<CargoPricingModel> {
    const cargoPricing = await this.cargoPricingModel
      .findOne({ id: id }, CargoPricingModelProjection)
      .populate(this.populateFields)
      .exec();
    if (!cargoPricing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cargo Pricing Not Found',
          errorCode: 'cargo_pricing_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return cargoPricing;
  }

  /*** returns cargo-supplier ObjectId if valid ***/
  public async checkExistingCargoPricing(
    supplierId: string,
    cargoMethod: string,
    sourceLocations: any[],
    destinationLocations: any[],
    exceptId: any = null,
  ) {
    const cargoSupplierObjectId = await this.cargoSupplierService.idToObjectId(
      supplierId,
    );

    for (const sourceLocation of sourceLocations) {
      const filter = {
        cargoMethod: cargoMethod,
        sourceLocations: { $in: [sourceLocation] },
        destinationLocations: { $in: destinationLocations },
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
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `The pricing for cargo method ${cargoMethod} with referenced locations already exists, please check entries`,
            errorCode: 'cargo_pricing_for_cargo_method_exists',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return cargoSupplierObjectId;
  }

  /** validates CargoPriceFields **/
  public validatePriceFields(prices: CargoPriceFieldModel[]) {
    const cargoTypes = prices.map((item) => item.cargoType);
    const uniqueCargoTypesSet = new Set(cargoTypes);
    if (cargoTypes.length != uniqueCargoTypesSet.size) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Please clear duplicate items in "prices" field`,
          errorCode: 'cargo_pricing_duplicate_price_validation_error',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  public async updateCargoSupplierServiceDetails(supplierObjectId: ObjectId) {
    const allCargoSupplierPricing = await this.filterCargoPricing({
      supplier: supplierObjectId,
    });

    const allServiceSourceLocations = allCargoSupplierPricing.map(
      (item) => item.sourceLocations,
    );
    const allServiceDestinationLocations = allCargoSupplierPricing.map(
      (item) => item.destinationLocations,
    );

    let sourceLocationList = [];
    allServiceSourceLocations.forEach((item) => {
      sourceLocationList = sourceLocationList.concat(item);
    });
    let sourceLocationIds = sourceLocationList.map((item) => item._id);
    sourceLocationIds = new Array(...new Set(sourceLocationIds));

    let destinationLocationList = [];
    allServiceDestinationLocations.forEach((item) => {
      destinationLocationList = destinationLocationList.concat(item);
    });
    let destinationLocationIds = destinationLocationList.map(
      (item) => item._id,
    );
    destinationLocationIds = new Array(...new Set(destinationLocationIds));

    const allPrices = allCargoSupplierPricing.map((item) => item.prices);
    let pricesList = [];
    allPrices.forEach((item) => {
      pricesList = pricesList.concat(item);
    });
    let priceValues = pricesList.map((item) => item.price);
    priceValues = new Array(...new Set(priceValues)).sort();
    const minPrice = priceValues.length ? priceValues[0] : 0;

    await this.cargoSupplierService.updateCargoSupplierByFilter(
      { _id: supplierObjectId },
      {
        serviceSourceLocations: sourceLocationIds,
        serviceDestinationLocations: destinationLocationIds,
        minPrice: minPrice,
      },
    );
  }

  public async updateCargoPricing(
    id: string,
    updateParams: CreateCargoPricingModel,
  ): Promise<CargoPricingModel> {
    this.validatePriceFields(updateParams.prices);

    updateParams.sourceLocations = await this.locationService.populateLocations(
      updateParams.sourceLocations,
    );

    updateParams.destinationLocations =
      await this.locationService.populateLocations(
        updateParams.destinationLocations,
      );

    updateParams.supplier = await this.checkExistingCargoPricing(
      updateParams.supplier,
      updateParams.cargoMethod,
      updateParams.sourceLocations,
      updateParams.destinationLocations,
      id,
    );

    const cargoPricing = await this.cargoPricingModel
      .findOneAndUpdate({ id: id }, updateParams)
      .exec();
    if (!cargoPricing) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cargo Pricing Not Found',
          errorCode: 'cargo_pricing_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.updateCargoSupplierServiceDetails(cargoPricing.supplier);

    return this.getCargoPricing(cargoPricing.id);
  }

  public async deleteCargoPricing(id): Promise<any> {
    const cargoPricing = await this.cargoPricingModel.deleteOne({ id: id });
    if (!cargoPricing.deletedCount) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cargo Pricing Not Found',
          errorCode: 'cargo_pricing_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return cargoPricing;
  }
}
