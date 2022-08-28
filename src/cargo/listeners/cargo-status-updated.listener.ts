import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SmsProviderService } from '../smsProvider.service';
import { CargoStatusUpdatedEvent } from '../events/cargo-status-updated.event';
import { CARGO_STATUSES } from '../models/cargo.model';

@Injectable()
export class CargoStatusUpdatedListener {
  constructor(private readonly smsProviderService: SmsProviderService) {}

  @OnEvent('cargo.status.updated')
  async handleCargoStatusUpdatedEvent(event: CargoStatusUpdatedEvent) {
    switch (event.status) {
      case CARGO_STATUSES.CANCELLED:
        await this.smsProviderService.sendCancelledSMS(
          event.cargoTrackingNumber,
          event.userPhoneNumber,
        );
        break;

      case CARGO_STATUSES.REJECTED:
        await this.smsProviderService.sendRejectedSMS(
          event.cargoTrackingNumber,
          event.userPhoneNumber,
        );
        break;

      case CARGO_STATUSES.SHIPPED:
        await this.smsProviderService.sendShippedSMS(
          event.cargoTrackingNumber,
          event.userPhoneNumber,
          event.cargoSupplierName,
        );
        break;

      case CARGO_STATUSES.DELIVERED:
        await this.smsProviderService.sendDeliveredSMS(
          event.cargoTrackingNumber,
          event.userPhoneNumber,
          event.cargoSupplierName,
        );
        break;
    }
  }
}
