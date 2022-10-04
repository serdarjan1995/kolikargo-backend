import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';
import { LocationService } from '../location/location.service';
import {
  CARGO_STATUSES,
  CargoModel,
  CreateCargoModel,
} from './models/cargo.model';
import { UserAddressService } from '../user-address/user-address.service';
import { CouponService } from '../coupon/coupon.service';
import { CargoPricingService } from '../cargo-pricing/cargo-pricing.service';
import { UserService } from '../user/user.service';
import {
  COUPON_DISCOUNT_TYPES,
  CouponModel,
  ValidateCouponModel,
} from '../coupon/models/coupon.model';
import { addDays, format as dateFormat } from 'date-fns';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CargoCreatedEvent,
  CargoCreatedSupplierEvent,
} from './events/cargo-created.event';
import { CargoStatusUpdatedEvent } from './events/cargo-status-updated.event';
import { CargoTrackingModel } from './models/cargoTracking.model';
import { CargoPublicTrackingModel } from './models/cargoPublicTracking.model';
import { CargoSupplierModel } from '../cargo-supplier/models/cargoSupplier.model';
import { censorString } from '../utils';
import {
  CargoTypeModel,
  CreateUpdateCargoTypeModel,
} from './models/cargoType.model';

const CargoModelProjection = {
  _id: false,
  __v: false,
  user: false,
};

const CargoModelPublicTrackingProjection = {
  _id: false,
  __v: false,
  serviceFee: false,
  usedCoupon: false,
  user: false,
  note: false,
};

const CargoTrackingModelProjection = {
  _id: false,
  __v: false,
  cargo: false,
};

@Injectable()
export class CargoService {
  constructor(
    @InjectModel('Cargo')
    private readonly cargoModel: Model<CargoModel>,
    @InjectModel('CargoTracking')
    private readonly cargoTrackingModel: Model<CargoTrackingModel>,
    @InjectModel('CargoType')
    private readonly cargoTypeModel: Model<CargoTypeModel>,
    private readonly cargoSupplierService: CargoSupplierService,
    private readonly locationService: LocationService,
    private readonly userAddressService: UserAddressService,
    private readonly couponService: CouponService,
    private readonly cargoPricingService: CargoPricingService,
    private readonly userService: UserService,
    private eventEmitter: EventEmitter2,
  ) {}

  public populateFields = [
    {
      path: 'supplier',
      select: 'id name description avatarUrl, stars',
    },
    {
      path: 'sourceLocation',
      select: 'id country city',
    },
    {
      path: 'destinationLocation',
      select: 'id country city',
    },
  ];

  public async filterCargo(filter: object): Promise<CargoModel[]> {
    return await this.cargoModel
      .find(filter, CargoModelProjection)
      .populate(this.populateFields)
      .exec();
  }

  public async listUserCargos(userId: string): Promise<CargoModel[]> {
    return await this.cargoModel
      .find(
        {
          user: await this.userService.idToObjectId(userId),
        },
        CargoModelProjection,
      )
      .populate(this.populateFields)
      .exec();
  }

  public async listSupplierCargos(supplierId: string): Promise<CargoModel[]> {
    return await this.cargoModel
      .find(
        {
          supplier: await this.cargoSupplierService.idToObjectId(supplierId),
        },
        CargoModelProjection,
      )
      .populate(this.populateFields)
      .exec();
  }

  public async createCargo(
    newCargo: CreateCargoModel,
    userId: string,
  ): Promise<CargoModel> {
    const user = await this.userService.getUserBy({ id: userId }, true, false);

    // user address validation
    const senderAddress = await this.userAddressService.getUserAddress(
      newCargo.pickupAddress,
      user.id,
      false,
    );
    newCargo.pickupAddress = { ...senderAddress['_doc'], user: user._id };

    const receiverAddress = await this.userAddressService.getUserAddress(
      newCargo.deliveryAddress,
      user.id,
      false,
    );
    newCargo.deliveryAddress = { ...receiverAddress['_doc'], user: user._id };

    const supplier = await this.cargoSupplierService.getCargoSupplier(
      newCargo.supplier,
      true,
    );
    if (newCargo.weight < supplier.minWeight) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Min weight should be ${supplier.minWeight}`,
          errorCode: 'min_weight_validation_err',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // validate source location
    const sourceLocationObjectId = await this.locationService.idToObjectId(
      newCargo.sourceLocation,
    );

    if (
      !supplier.serviceSourceLocations.find(
        (l) => l._id.toString() == sourceLocationObjectId.toString(),
      )
    ) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Cargo Supplier does not service in specified sourceLocation`,
          errorCode: 'service_source_location_error',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    newCargo.sourceLocation = sourceLocationObjectId;

    // validate destination location
    const destinationLocationObjectId = await this.locationService.idToObjectId(
      newCargo.destinationLocation,
    );
    if (
      !supplier.serviceDestinationLocations.find(
        (l) => l._id.toString() == destinationLocationObjectId.toString(),
      )
    ) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Cargo Supplier does not service in specified destinationLocation`,
          errorCode: 'service_destination_location_error',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    newCargo.destinationLocation = destinationLocationObjectId;

    // check cargo type & method
    const cargoPricing = await this.cargoPricingService.filterOneCargoPricing(
      {
        supplier: supplier._id,
        cargoMethod: newCargo.cargoMethod,
      },
      true,
    );
    const priceSupported = cargoPricing.prices.find(
      (p) => p.cargoType === newCargo.cargoType,
    );
    if (!priceSupported) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Cargo Type ${newCargo.cargoType} is not supported by supplier`,
          errorCode: 'cargo_supplier_cargo_type_not_supported',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let coupon: CouponModel = null;
    if (newCargo?.usedCoupon) {
      coupon = await this.couponService.validateCoupon({
        code: newCargo.usedCoupon,
        supplier: supplier.id,
      } as ValidateCouponModel);
    }

    let serviceFeePerWeight = 0;
    if (newCargo.weight < 10) {
      // below 10 kg => 0.25 cent per kg
      serviceFeePerWeight = 0.25;
    } else if (newCargo.weight < 20) {
      serviceFeePerWeight = 0.2;
    } else if (newCargo.weight < 100) {
      serviceFeePerWeight = 0.1;
    }

    const serviceFee = serviceFeePerWeight * newCargo.weight;
    const fee = newCargo.weight * priceSupported.price;
    let totalFee = fee;
    if (coupon && coupon.discountType == COUPON_DISCOUNT_TYPES.FIXED) {
      totalFee -= coupon.discountValue;
    } else if (
      coupon &&
      coupon.discountType == COUPON_DISCOUNT_TYPES.PERCENTAGE
    ) {
      totalFee -= totalFee * (coupon.discountValue / 100);
    }
    if (totalFee < 0) {
      totalFee = 0;
    }
    totalFee += serviceFee;

    const estimatedDeliveryDate = addDays(
      new Date(),
      supplier.deliveryEstimationMax,
    );

    const cargoDetailsFinal = {
      ...newCargo,
      createdAt: new Date(),
      status: CARGO_STATUSES.NEW_REQUEST,
      serviceFee: serviceFee.toFixed(2),
      fee: fee.toFixed(2),
      totalFee: totalFee.toFixed(2),
      user: user._id,
      supplier: supplier._id,
      estimatedDeliveryDate: dateFormat(estimatedDeliveryDate, 'yyyy-MM-dd'),
    };

    const cargo = await this.cargoModel.create(cargoDetailsFinal);
    await cargo.validate();
    await cargo.save();

    const cargoTrackingDetail = {
      status: cargo.status,
      datetime: new Date(),
      note: '',
      cargo: cargo,
    };
    const cargoTracking = await this.cargoTrackingModel.create(
      cargoTrackingDetail,
    );
    await cargoTracking.validate();
    await cargoTracking.save();

    const savedCargo = await this.getCargo(cargo.id);

    // for user
    const cargoCreatedEvent = new CargoCreatedEvent();
    cargoCreatedEvent.cargoSupplierName = supplier.name;
    cargoCreatedEvent.cargoTrackingNumber = cargo.trackingNumber;
    cargoCreatedEvent.userPhoneNumber = user.phoneNumber;
    this.eventEmitter.emit('cargo.created', cargoCreatedEvent);

    // for supplier
    const supplierUser = await this.cargoSupplierService.getCargoSupplierUser(
      supplier.id,
    );
    const cargoCreatedSupplierEvent = new CargoCreatedSupplierEvent();
    cargoCreatedSupplierEvent.cargoSupplierName = supplier.name;
    cargoCreatedSupplierEvent.cargoSupplierPhoneNumber =
      supplierUser.user.phoneNumber;
    cargoCreatedSupplierEvent.link = `https://api.kolikargo.com/track-cargo/${cargo.trackingNumber}?authToken=${supplier.publicAuthToken}`;
    this.eventEmitter.emit('cargo.created.supplier', cargoCreatedSupplierEvent);

    return savedCargo;
  }

  public async getCargo(id, noProjection = false): Promise<CargoModel> {
    const cargo = await this.cargoModel
      .findOne({ id: id }, noProjection ? null : CargoModelProjection)
      .populate(this.populateFields)
      .exec();
    if (!cargo) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Cargo Not Found`,
          errorCode: 'cargo_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return cargo;
  }

  public async getCargoByFiler(
    filter: object,
    noProjection = false,
  ): Promise<CargoModel> {
    const cargo = await this.cargoModel
      .findOne(filter, noProjection ? null : CargoModelProjection)
      .populate(this.populateFields)
      .exec();
    if (!cargo) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Cargo Not Found`,
          errorCode: 'cargo_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return cargo;
  }

  public async getCargoDetailsByTrackingNumber(
    trackingNumber: string,
    isPublicTracking = true,
    authToken = '',
  ): Promise<CargoPublicTrackingModel> {
    const cargo = await this.cargoModel
      .findOne(
        { trackingNumber: trackingNumber },
        isPublicTracking
          ? CargoModelPublicTrackingProjection
          : CargoModelProjection,
      )
      .populate(this.populateFields)
      .exec();
    if (!cargo) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Cargo Not Found`,
          errorCode: 'cargo_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    let cargoSupplier: null | CargoSupplierModel = null;
    if (authToken && authToken != '') {
      // find related cargoSupplier with authToken
      cargoSupplier = await this.cargoSupplierService.getCargoSupplierByFilter({
        publicAuthToken: authToken,
        id: cargo.supplier.id,
      });
    }

    const tracking = await this.getCargoTracking(cargo.id);
    const cargoJson = JSON.stringify(cargo);
    const cargoParsed = JSON.parse(cargoJson);

    if (isPublicTracking && !cargoSupplier) {
      cargoParsed['pickupAddress']['contactName'] = censorString(
        cargoParsed['pickupAddress']['contactName'],
        2,
      );

      cargoParsed['pickupAddress']['contactSurname'] = censorString(
        cargoParsed['pickupAddress']['contactSurname'],
        2,
      );

      cargoParsed['pickupAddress']['contactPhoneNumber'] = censorString(
        cargoParsed['pickupAddress']['contactPhoneNumber'],
        3,
        2,
      );

      cargoParsed['pickupAddress']['city'] = censorString(
        cargoParsed['pickupAddress']['city'],
        3,
      );

      cargoParsed['pickupAddress']['district'] = censorString(
        cargoParsed['pickupAddress']['district'],
        3,
      );

      cargoParsed['pickupAddress']['houseNo'] = '*';
      cargoParsed['pickupAddress']['floorNo'] = '*';
      cargoParsed['pickupAddress']['doorNo'] = '*';
      cargoParsed['pickupAddress']['addressLine'] = '*';

      // delivery address starring
      cargoParsed['deliveryAddress']['contactName'] = censorString(
        cargoParsed['deliveryAddress']['contactName'],
        2,
      );

      cargoParsed['deliveryAddress']['contactSurname'] = censorString(
        cargoParsed['deliveryAddress']['contactSurname'],
        2,
      );

      cargoParsed['deliveryAddress']['contactPhoneNumber'] = censorString(
        cargoParsed['deliveryAddress']['contactPhoneNumber'],
        3,
        2,
      );
      cargoParsed['pickupAddress']['houseNo'] = '*';
      cargoParsed['pickupAddress']['floorNo'] = '*';
      cargoParsed['pickupAddress']['doorNo'] = '*';

      cargoParsed['deliveryAddress']['addressLine'] = censorString(
        cargoParsed['deliveryAddress']['addressLine'],
        3,
      );
    }
    return { ...(cargoParsed as CargoModel), tracking };
  }

  public async getCargoTracking(cargoId): Promise<CargoTrackingModel[]> {
    const cargo = await this.cargoModel
      .findOne({ id: cargoId })
      .populate(this.populateFields)
      .exec();
    if (!cargo) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Cargo Not Found`,
          errorCode: 'cargo_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.cargoTrackingModel
      .find({ cargo: cargo._id }, CargoTrackingModelProjection)
      .sort('+datetime')
      .exec();
  }

  public async updateCargo(id: string, updateParams): Promise<CargoModel> {
    const note = updateParams?.note;
    delete updateParams.note;
    let cargo = await this.cargoModel
      .findOneAndUpdate({ id: id }, updateParams)
      .exec();
    if (!cargo) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Cargo Not Found`,
          errorCode: 'cargo_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    let updatedCargo = await this.getCargo(cargo.id);
    if (updateParams?.status && updateParams.status != cargo.status) {
      const user = await this.userService.getUserBy({ _id: cargo.user });
      const cargoStatusUpdatedEvent = new CargoStatusUpdatedEvent();
      cargoStatusUpdatedEvent.cargoSupplierName = updatedCargo.supplier.name;
      cargoStatusUpdatedEvent.cargoTrackingNumber = cargo.trackingNumber;
      cargoStatusUpdatedEvent.userPhoneNumber = user.phoneNumber;
      cargoStatusUpdatedEvent.status = updateParams.status;
      this.eventEmitter.emit('cargo.status.updated', cargoStatusUpdatedEvent);
      const cargoTrackingDetail = {
        status: updateParams.status,
        datetime: new Date(),
        note: note,
        cargo: cargo,
      };
      const cargoTracking = await this.cargoTrackingModel.create(
        cargoTrackingDetail,
      );
      await cargoTracking.validate();
      await cargoTracking.save();

      if (updateParams.status == CARGO_STATUSES.DELIVERED) {
        cargo = await this.cargoModel
          .findOneAndUpdate(
            { id: updatedCargo.id },
            { deliveredDate: new Date(), reviewEligible: true },
          )
          .exec();
        updatedCargo = await this.getCargo(cargo.id);
      }
    }
    return updatedCargo;
  }

  public async idToObjectId(id: string): Promise<Types.ObjectId> {
    if (!id) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Cargo id should be specified`,
          errorCode: 'cargo_not_found',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const cargo = await this.cargoModel.findOne({ id: id }).exec();
    if (!cargo) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Cargo ${id} Not Found`,
          errorCode: 'cargo_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return cargo._id;
  }

  public async createCargoType(
    newCargoType: CreateUpdateCargoTypeModel,
  ): Promise<CargoTypeModel> {
    const cargoType = await this.cargoTypeModel.create(newCargoType);
    await cargoType.validate();
    await cargoType.save();
    return await this.getCargoType(cargoType.id);
  }

  public async updateCargoType(
    id: string,
    updateParams,
  ): Promise<CargoTypeModel> {
    const cargoType = await this.cargoTypeModel
      .findOneAndUpdate({ id: id }, updateParams)
      .exec();
    if (!cargoType) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Cargo Type Not Found`,
          errorCode: 'cargo_type_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.getCargoType(cargoType.id);
  }

  public async getCargoTypes(): Promise<CargoTypeModel[]> {
    return await this.cargoTypeModel
      .find({}, { _id: false, __v: false })
      .exec();
  }

  public async getCargoType(id: string): Promise<CargoTypeModel> {
    const cargoType = await this.cargoTypeModel
      .findOne({ id: id }, { _id: false, __v: false })
      .exec();
    if (!cargoType) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Cargo Type Not Found`,
          errorCode: 'cargo_type_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return cargoType;
  }
}
