import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CargoApplyCommissionsEvent } from '../events/cargo-apply-commissions.event';
import { CargoService } from '../cargo.service';
import { CargoCommissionService } from '../cargoCommission.service';
import { CargoSupplierService } from '../../cargo-supplier/cargo-supplier.service';
import { CargoPricingService } from '../../cargo-pricing/cargo-pricing.service';
import { LocationService } from '../../location/location.service';
import { PRICING_TYPE } from '../../cargo-pricing/models/cargoPricing.model';
import {
  CreateCargoSupplierPaymentModel,
  PAYMENT_STATUS,
} from '../models/cargoSupplierPayment.model';

@Injectable()
export class CargoApplyCommissionsListener {
  constructor(
    private readonly cargoService: CargoService,
    private readonly cargoSupplierService: CargoSupplierService,
    private readonly cargoPricingService: CargoPricingService,
    private readonly cargoCommissionService: CargoCommissionService,
    private readonly locationService: LocationService,
  ) {}

  @OnEvent('cargo.apply.commissions')
  async handleCargoApplyCommissionsEvent(event: CargoApplyCommissionsEvent) {
    const cargo = await this.cargoService.findOneCargoByFilter(
      {
        id: event.cargoId,
      },
      true,
    );
    const cargoSupplier =
      await this.cargoSupplierService.getCargoSupplierByFilter(
        { id: cargo.supplier.id },
        true,
        false,
      );

    const sourceLocationObjectId = await this.locationService.idToObjectId(
      cargo.sourceLocation.id,
    );
    const destinationLocationObjectId = await this.locationService.idToObjectId(
      cargo.destinationLocation.id,
    );

    const cargoSupplierPricing =
      await this.cargoPricingService.filterOneCargoPricing(
        {
          supplier: cargoSupplier._id,
          cargoMethod: cargo.cargoMethod,
          sourceLocations: { $in: [sourceLocationObjectId] },
          destinationLocations: { $in: [destinationLocationObjectId] },
        },
        true,
      );

    let supplierCommission = 0;
    for (const cargoItem of cargo.cargoItems) {
      const cargoTypePricing = cargoSupplierPricing.prices.find(
        (c) => c.cargoType == cargoItem.cargoType,
      );
      if (cargoItem.pricingType == PRICING_TYPE.PER_WEIGHT) {
        supplierCommission += cargoItem.weight * cargoTypePricing.commission;
      } else if (cargoItem.pricingType == PRICING_TYPE.PER_ITEM) {
        supplierCommission += cargoItem.qty * cargoTypePricing.commission;
      }
    }

    const newCargoSupplierPayment = new CreateCargoSupplierPaymentModel();
    newCargoSupplierPayment.supplierCommission = supplierCommission;
    newCargoSupplierPayment.customerCommission = cargo.serviceFee;
    newCargoSupplierPayment.supplier = cargoSupplier._id;
    newCargoSupplierPayment.cargo = cargo._id;
    newCargoSupplierPayment.revenue = cargo.totalFee;
    newCargoSupplierPayment.profit = cargo.fee - supplierCommission;
    newCargoSupplierPayment.commission = supplierCommission + cargo.serviceFee;
    newCargoSupplierPayment.paymentStatus = PAYMENT_STATUS.PENDING;

    await this.cargoCommissionService.createCargoSupplierPayment(
      newCargoSupplierPayment,
    );
  }
}
