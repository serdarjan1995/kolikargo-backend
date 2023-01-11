import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CargoSupplierPaymentModel,
  ChangeCargoSupplierPaymentPeriodPaymentStatusModel,
  CreateCargoSupplierPaymentModel,
  CreateCargoSupplierPaymentPeriodModel,
  PAYMENT_STATUS,
} from './models/cargoSupplierPayment.model';
import { SupplierCargoStatsModel } from './models/SupplierCargoStats.model';
import { CARGO_STATUSES } from './models/cargo.model';
import { CargoService } from './cargo.service';
import { CargoSupplierPaymentPeriodModel } from './models/cargoSupplierPaymentPeriod.model';

const CargoSupplierPaymentModelProjection = {
  _id: false,
  __v: false,
};

@Injectable()
export class CargoCommissionService {
  constructor(
    @InjectModel('CargoSupplierPayment')
    private readonly cargoSupplierPaymentModel: Model<CargoSupplierPaymentModel>,
    private readonly cargoSupplierService: CargoSupplierService,
    private readonly cargoService: CargoService,
    private eventEmitter: EventEmitter2,
  ) {}

  public populateFields = [
    {
      path: 'cargo',
      select:
        'id trackingNumber createdAt pickupAddress.contactName pickupAddress.contactSurname pickupAddress.country pickupAddress.province deliveryAddress.country deliveryAddress.province',
    },
    {
      path: 'supplier',
      select: 'id name description avatarUrl stars',
    },
  ];

  public async supplierCargoStats(
    supplierId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<SupplierCargoStatsModel> {
    const supplier = await this.cargoSupplierService.idToObjectId(supplierId);
    const filter = {
      supplier: supplier,
      createdAt: { $gte: startDate, $lte: endDate },
    };

    const cargos = await this.cargoService.filterCargo(filter, true);
    const allCargoObjectIds = cargos.map((c) => c._id);

    const newCargos = cargos.filter(
      (c) => c.status == CARGO_STATUSES.NEW_REQUEST,
    );
    const deliveredCargos = cargos.filter(
      (c) => c.status == CARGO_STATUSES.DELIVERED,
    );
    const notInProgressStatuses = [
      CARGO_STATUSES.NEW_REQUEST,
      CARGO_STATUSES.DELIVERED,
      CARGO_STATUSES.CANCELLED,
      CARGO_STATUSES.REJECTED,
    ];
    const inProgressCargos = cargos.filter(
      (c) => !notInProgressStatuses.includes(<CARGO_STATUSES>c.status),
    );

    const stat = new SupplierCargoStatsModel();
    stat.totalCargos = cargos.length;
    stat.newCargos = newCargos.length;
    stat.inProgressCargos = inProgressCargos.length;
    stat.deliveredCargos = deliveredCargos.length;

    const payments = await this.cargoSupplierPaymentModel.aggregate([
      {
        $match: {
          supplier: supplier,
          cargo: { $in: allCargoObjectIds },
        },
      },
      {
        $group: {
          _id: {
            stats: 'stats',
          },
          totalRevenue: { $sum: '$revenue' },
          totalProfit: { $sum: '$profit' },
          totalSupplierCommission: { $sum: '$supplierCommission' },
          totalCustomerCommission: { $sum: '$customerCommission' },
          totalCommission: { $sum: '$commission' },
        },
      },
      {
        $project: {
          _id: 0,
          paymentStatus: '$paymentStatus',
          totalRevenue: '$totalRevenue',
          totalProfit: '$totalProfit',
          totalSupplierCommission: '$totalSupplierCommission',
          totalCustomerCommission: '$totalCustomerCommission',
          totalCommission: '$totalCommission',
        },
      },
    ]);
    stat.profit = Number(payments[0].totalProfit.toFixed(2));
    stat.commissionPayments = Number(payments[0].totalCommission.toFixed(2));

    return stat;
  }

  public async createCargoSupplierPayment(
    newCargoSupplierPayment: CreateCargoSupplierPaymentModel,
  ) {
    const cargoSupplierPaymentFinal = {
      ...newCargoSupplierPayment,
      datetime: new Date(),
    };

    const cargoSupplierPayment = await this.cargoSupplierPaymentModel.create(
      cargoSupplierPaymentFinal,
    );
    await cargoSupplierPayment.validate();
    await cargoSupplierPayment.save();
    return cargoSupplierPayment;
  }

  public async createCargoSupplierPaymentPeriod(
    newCargoSupplierPaymentPeriod: CreateCargoSupplierPaymentPeriodModel,
  ) {
    const period = newCargoSupplierPaymentPeriod.period;
    const supplier = await this.cargoSupplierService.idToObjectId(
      newCargoSupplierPaymentPeriod.supplier,
    );
    if (![1, 15].includes(period.getDate())) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Date should be either 1 or 15 of each month`,
          errorCode: 'invalid_date_for_commission_period',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    // clear time values
    period.setHours(0);
    period.setMinutes(0);
    period.setSeconds(0);
    period.setMilliseconds(0);

    await this.cargoSupplierPaymentModel.updateMany(
      {
        datetime: { $lte: period },
        period: null,
        supplier: supplier,
      },
      { period: period },
    );
  }

  public async changeCargoSupplierPaymentPeriodPaymentStatus(
    cargoSupplierPayment: ChangeCargoSupplierPaymentPeriodPaymentStatusModel,
  ) {
    const period = cargoSupplierPayment.period;
    if (![1, 15].includes(period.getDate())) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Date should be either 1 or 15 of each month`,
          errorCode: 'invalid_date_for_commission_period',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    // clear time values
    period.setHours(0);
    period.setMinutes(0);
    period.setSeconds(0);
    period.setMilliseconds(0);

    await this.cargoSupplierPaymentModel.updateMany(
      {
        period: period,
      },
      { paymentStatus: cargoSupplierPayment.paymentStatus },
    );

    return { success: true };
  }

  public async listCargoSupplierPaymentPeriods(supplierId, startDate, endDate) {
    const supplier = await this.cargoSupplierService.idToObjectId(supplierId);
    return this.cargoSupplierPaymentModel.aggregate([
      {
        $match: {
          supplier: supplier,
          datetime: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            period: '$period',
          },
          paymentStatus: {
            $accumulator: {
              init: `function(){return "${PAYMENT_STATUS.PAID}"}`,
              accumulate: `function(state, paymentStatus){if(paymentStatus != "${PAYMENT_STATUS.PAID}"){return "${PAYMENT_STATUS.PENDING}";} return state; }`,
              accumulateArgs: ['$paymentStatus'],
              merge: `function(state1, state2){return if (state1 == state2 && state1 == "${PAYMENT_STATUS.PAID}") {return "${PAYMENT_STATUS.PAID}1";} return "2${PAYMENT_STATUS.PENDING}"}`,
              lang: 'js',
            },
          },
          totalRevenue: { $sum: '$revenue' },
          totalProfit: { $sum: '$profit' },
          totalSupplierCommission: { $sum: '$supplierCommission' },
          totalCustomerCommission: { $sum: '$customerCommission' },
          totalCommission: { $sum: '$commission' },
        },
      },
      {
        $project: {
          _id: 0,
          period: '$_id.period',
          paymentStatus: '$paymentStatus',
          totalRevenue: '$totalRevenue',
          totalProfit: '$totalProfit',
          totalSupplierCommission: '$totalSupplierCommission',
          totalCustomerCommission: '$totalCustomerCommission',
          totalCommission: '$totalCommission',
        },
      },
      {
        $sort: { period: 1 },
      },
    ]);
  }

  public async listPaymentsOfThePeriod(supplierId: string, period: Date) {
    const supplier = await this.cargoSupplierService.idToObjectId(supplierId);
    // clear time values
    period.setHours(0);
    period.setMinutes(0);
    period.setSeconds(0);
    period.setMilliseconds(0);

    return this.cargoSupplierPaymentModel
      .find(
        {
          supplier: supplier,
          period: period,
        },
        CargoSupplierPaymentModelProjection,
      )
      .populate(this.populateFields);
  }
}
