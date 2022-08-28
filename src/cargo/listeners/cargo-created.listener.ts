import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CargoCreatedEvent } from '../events/cargo-created.event';
import { SmsProviderService } from '../smsProvider.service';

@Injectable()
export class CargoCreatedListener {
  constructor(private readonly smsProviderService: SmsProviderService) {}

  @OnEvent('cargo.created')
  async handleCargoCreatedEvent(event: CargoCreatedEvent) {
    await this.smsProviderService.sendCreatedSMS(
      event.cargoTrackingNumber,
      event.userPhoneNumber,
    );
  }
}
