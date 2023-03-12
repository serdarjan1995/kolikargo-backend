import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';
import { LocationService } from '../location/location.service';
import {
  CARGO_STATUSES,
  CargoModel,
  CreateCargoModel,
  TRIGGER_CONFIRMED_STATUSES_FOR_COMMISSION,
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
import { PRICING_TYPE } from '../cargo-pricing/models/cargoPricing.model';
import { ListFilterSupplierCargosModel } from './models/ListFilterSupplierCargos.model';
import {
  CargoStatusChangeActionModel,
  CreateCargoStatusChangeActionModel,
} from './models/cargoStatusChangeAction.model';
import { CargoApplyCommissionsEvent } from './events/cargo-apply-commissions.event';

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

const CargoStatusChangeActionProjection = {
  _id: false,
  __v: false,
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
    @InjectModel('CargoStatusChangeAction')
    private readonly cargoStatusChangeActionModel: Model<CargoStatusChangeActionModel>,
    private readonly cargoSupplierService: CargoSupplierService,
    private readonly locationService: LocationService,
    private readonly userAddressService: UserAddressService,
    @Inject(forwardRef(() => CouponService))
    private readonly couponService: CouponService,
    private readonly cargoPricingService: CargoPricingService,
    private readonly userService: UserService,
    private eventEmitter: EventEmitter2,
  ) {}

  public populateFields = [
    {
      path: 'supplier',
      select: 'id name description avatarUrl stars',
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

  public async findOneCargoByFilter(
    filter: object,
    noProjection = false,
  ): Promise<CargoModel> {
    return await this.cargoModel
      .findOne(filter, noProjection ? null : CargoModelProjection)
      .populate(this.populateFields)
      .exec();
  }

  public async filterCargo(
    filter: object,
    noProjection = false,
  ): Promise<CargoModel[]> {
    return await this.cargoModel
      .find(filter, noProjection ? null : CargoModelProjection)
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
        { sort: { createdAt: -1 } },
      )
      .populate(this.populateFields)
      .exec();
  }

  public async listSupplierCargos(
    supplierId: string,
    query: ListFilterSupplierCargosModel,
  ): Promise<CargoModel[]> {
    const filter = {
      supplier: await this.cargoSupplierService.idToObjectId(supplierId),
    };
    if (query.startDate) {
      filter['createdAt'] = { $gte: query.startDate };
    }
    if (query.endDate) {
      filter['createdAt'] = { $lte: query.endDate };
    }
    if (query.status) {
      filter['status'] = query.status;
    }
    if (query.trackingNumber) {
      filter['trackingNumber'] = {
        $regex: `.*${query.trackingNumber}.*`,
        $options: 'i',
      };
    }

    if (query.contactName) {
      filter['$or'] = [
        {
          'pickupAddress.contactName': {
            $regex: `.*${query.contactName}.*`,
            $options: 'i',
          },
        },
        {
          'pickupAddress.contactSurname': {
            $regex: `.*${query.contactName}.*`,
            $options: 'i',
          },
        },
      ];
    }

    const pageNum = parseInt(query.page as any) || 1;
    const perPage = parseInt(query.perPage as any) || 10;

    return await this.cargoModel
      .find(filter, CargoModelProjection)
      .populate(this.populateFields)
      .sort({ createdAt: 'desc' })
      .skip((pageNum - 1) * perPage)
      .limit(perPage)
      .exec();
  }

  public async getSupplierCargoDetail(
    supplierId: string,
    cargoId: string,
  ): Promise<CargoModel> {
    return await this.cargoModel
      .findOne(
        {
          supplier: await this.cargoSupplierService.idToObjectId(supplierId),
          id: cargoId,
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
        sourceLocations: { $in: [sourceLocationObjectId] },
        destinationLocations: { $in: [destinationLocationObjectId] },
      },
      true,
    );

    let totalFeeActual = 0;
    let totalWeight = 0;
    let totalQty = 0;
    let totalQtyOfPricePerItemProduct = 0;
    for (const cargoItem of newCargo.cargoItems) {
      // check cargoItem.cargoType is valid for pricing ( not parent types )
      await this.getCargoTypeByFilter({
        name: cargoItem.cargoType,
        hasSubType: false, // ignore parent cargo category types
      });
      // at this point all cargoTypes validated via above query

      const priceSupported = cargoPricing.prices.find(
        (p) => p.cargoType === cargoItem.cargoType,
      );
      if (!priceSupported) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Cargo Type ${cargoItem.cargoType} is not supported by supplier`,
            errorCode: 'cargo_supplier_cargo_type_not_supported',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      cargoItem.pricingType = priceSupported.pricingType;
      totalWeight += cargoItem.weight;
      totalQty += cargoItem.qty;
      // calculate fees
      switch (priceSupported.pricingType) {
        case PRICING_TYPE.PER_WEIGHT:
          totalFeeActual += cargoItem.weight * priceSupported.price;
          break;

        case PRICING_TYPE.PER_ITEM:
          totalQtyOfPricePerItemProduct += 1;
          totalFeeActual += cargoItem.qty * priceSupported.price;
          break;
      }
    }

    if (totalWeight < supplier.minWeight) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Min weight should be ${supplier.minWeight}`,
          errorCode: 'min_weight_validation_err',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // calculate service fees
    let serviceFeePerWeight = 0;
    if (totalWeight < 10) {
      // below 10 kg => 0.25 cent per kg
      serviceFeePerWeight = 0.25;
    } else if (totalWeight < 20) {
      serviceFeePerWeight = 0.2;
    } else if (totalWeight < 100) {
      serviceFeePerWeight = 0.1;
    }

    const serviceFee =
      serviceFeePerWeight * totalWeight + totalQtyOfPricePerItemProduct * 3;

    let coupon: CouponModel = null;
    if (newCargo?.usedCoupon) {
      coupon = await this.couponService.validateCoupon(
        {
          code: newCargo.usedCoupon,
          supplier: supplier.id,
        } as ValidateCouponModel,
        user.id,
      );
      if (coupon.minWeight > totalWeight) {
        coupon = null;
      }
    }

    let totalFee = totalFeeActual;
    let couponValue = 0;
    if (coupon && coupon.discountType == COUPON_DISCOUNT_TYPES.FIXED) {
      couponValue = coupon.discountValue;
    } else if (
      coupon &&
      coupon.discountType == COUPON_DISCOUNT_TYPES.PERCENTAGE
    ) {
      couponValue = totalFee * (coupon.discountValue / 100);
    }

    totalFee -= couponValue;

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
      usedCouponValue: couponValue,
      createdAt: new Date(),
      status: CARGO_STATUSES.NEW_REQUEST,
      serviceFee: serviceFee.toFixed(2),
      fee: totalFeeActual.toFixed(2),
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
      supplierUser.phoneNumber;
    cargoCreatedSupplierEvent.link = `https://tracking.kolikargo.com/track/${cargo.trackingNumber}?authToken=${supplier.publicAuthToken}`;
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
    raiseException = true,
  ): Promise<CargoModel> {
    const cargo = await this.cargoModel
      .findOne(filter, noProjection ? null : CargoModelProjection)
      .populate(this.populateFields)
      .exec();
    if (!cargo && raiseException) {
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

  public async updateCargo(
    id: string,
    updateParams,
    byTrackingNumber = false,
    additionalFilter = {},
  ): Promise<CargoModel> {
    const note = updateParams?.note;
    delete updateParams.note;
    delete updateParams.trackingNumber;
    const findFilter = {
      ...additionalFilter,
    };
    if (byTrackingNumber) {
      findFilter['trackingNumber'] = id;
    } else {
      findFilter['id'] = id;
    }
    let cargo = await this.cargoModel
      .findOneAndUpdate(findFilter, updateParams)
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
      if (
        cargo.status == CARGO_STATUSES.NEW_REQUEST &&
        TRIGGER_CONFIRMED_STATUSES_FOR_COMMISSION.includes(updateParams.status)
      ) {
        const cargoApplyCommissionEvent = new CargoApplyCommissionsEvent();
        cargoApplyCommissionEvent.cargoId = cargo.id;
        this.eventEmitter.emit(
          'cargo.apply.commissions',
          cargoApplyCommissionEvent,
        );
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
    const cargoTypeExists = await this.cargoTypeModel
      .findOne({ name: newCargoType.name })
      .exec();
    if (cargoTypeExists) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `CargoType ${newCargoType.name} already exists`,
          errorCode: 'cargo_type_already_exists',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (newCargoType.isSubType && newCargoType.parent) {
      newCargoType.parent = await this.cargoTypeIdToObjectId(
        newCargoType.parent,
      );
    }
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

  public async getCargoTypes(flat = false): Promise<CargoTypeModel[]> {
    if (flat) {
      // just return all cargo-types without modifying anything
      return await this.cargoTypeModel
        .find({}, { __v: false }, { sort: { order: 1 } })
        .exec();
    }
    // get cargo-types with hasSubType=false
    const cargoTypesTopTier = await this.cargoTypeModel
      .find({ isSubType: false }, { __v: false }, { sort: { order: 1 } })
      .exec();

    // add subTypes to its parent
    const subTypeAggregated: CargoTypeModel[] = [];
    for (let ct of cargoTypesTopTier) {
      ct = ct.toObject();
      if (ct.hasSubType) {
        ct.subTypes = await this.cargoTypeModel
          .find({ parent: ct._id }, { _id: false, __v: false })
          .exec();
      }
      subTypeAggregated.push(ct);
    }
    return subTypeAggregated;
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

  public async getCargoTypeByFilter(filter: object): Promise<CargoTypeModel> {
    const cargoType = await this.cargoTypeModel
      .findOne(filter, { _id: false, __v: false })
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

  public async cargoTypeIdToObjectId(id: string): Promise<Types.ObjectId> {
    if (!id) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Cargo Type id should be specified`,
          errorCode: 'cargo_type_not_found',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const cargoType = await this.cargoTypeModel.findOne({ id: id }).exec();
    if (!cargoType) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Cargo Type ${id} Not Found`,
          errorCode: 'cargo_type_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return cargoType._id;
  }

  public async createCargoStatusChangeAction(
    newCargoStatusChangeAction: CreateCargoStatusChangeActionModel,
  ): Promise<CargoStatusChangeActionModel> {
    const existingCargoStatusChangeAction =
      await this.getCargoStatusChangeAction(
        <CARGO_STATUSES>newCargoStatusChangeAction.fromStatus,
        false,
      );
    if (existingCargoStatusChangeAction) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Cargo Status Change Action already exists`,
          errorCode: 'cargo_status_change_action_already_exists',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const cargoStatusChangeAction =
      await this.cargoStatusChangeActionModel.create(
        newCargoStatusChangeAction,
      );
    await cargoStatusChangeAction.validate();
    await cargoStatusChangeAction.save();

    return await this.getCargoStatusChangeAction(
      <CARGO_STATUSES>cargoStatusChangeAction.fromStatus,
    );
  }

  public async getCargoStatusChangeAction(
    status: CARGO_STATUSES,
    raiseException = true,
  ): Promise<CargoStatusChangeActionModel> {
    const cargoStatusChangeAction =
      await this.cargoStatusChangeActionModel.findOne(
        { fromStatus: status },
        CargoStatusChangeActionProjection,
      );

    if (!cargoStatusChangeAction && raiseException) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Cargo Status Change Action Not Found`,
          errorCode: 'cargo_status_change_action_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return cargoStatusChangeAction;
  }
}
