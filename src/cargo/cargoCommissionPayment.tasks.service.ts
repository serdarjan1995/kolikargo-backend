import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';
import { CargoCommissionService } from './cargoCommission.service';
import { CreateCargoSupplierPaymentPeriodModel } from './models/cargoSupplierPayment.model';

@Injectable()
export class CargoCommissionPaymentTasksService {
  constructor(
    private readonly cargoSupplierService: CargoSupplierService,
    private readonly cargoCommissionService: CargoCommissionService,
  ) {}
  private readonly logger = new Logger(CargoCommissionPaymentTasksService.name);

  @Cron('0 0 1,15 * *')
  async handleCron() {
    const currentDate = new Date();
    this.logger.debug(`CargoCommissionPayment task called ${currentDate}`);
    const activeCargoSuppliers =
      await this.cargoSupplierService.getCargoSuppliers({ isActive: true });

    for (const cargoSupplier of activeCargoSuppliers) {
      await this.cargoCommissionService.createCargoSupplierPaymentPeriod({
        supplier: cargoSupplier.id,
        period: new Date(),
      } as CreateCargoSupplierPaymentPeriodModel);
    }
  }
}
