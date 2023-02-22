import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class SmsProviderService {
  constructor(private readonly userService: UserService) {}

  public async sendCreatedSMStoSupplier(
    cargoSupplierPhoneNumber: string,
    link: string,
  ) {
    const message = `Değerli ortağımız.\nYeni kargo talebi oluşturulmuştur. \n ${link} linkinden detaylara ulaşabilirsiniz.\n\nKolikargo`;
    return this.userService.sendSMS(cargoSupplierPhoneNumber, message);
  }

  public async sendCreatedSMS(
    cargoTrackingNumber: string,
    phoneNumber: string,
  ) {
    const message = `Değerli müşterimiz.\n${cargoTrackingNumber} takip nolu siparişiniz oluşturulmuştur. En yakın zamanda gönderileriniz adresinizden alınacaktır.\n\nKolikargo`;
    this.userService.sendSMS('+905531569445', message);
    return this.userService.sendSMS(phoneNumber, message);
  }

  public async sendRejectedSMS(
    cargoTrackingNumber: string,
    phoneNumber: string,
  ) {
    const message = `Değerli müşterimiz.\n${cargoTrackingNumber} takip nolu siparişiniz onaylanmamıştır.\n\nKolikargo`;
    return this.userService.sendSMS(phoneNumber, message);
  }

  public async sendCancelledSMS(
    cargoTrackingNumber: string,
    phoneNumber: string,
  ) {
    const message = `Değerli müşterimiz.\n${cargoTrackingNumber} takip nolu siparişiniz iptal edilmiştir.\n\nKolikargo`;
    return this.userService.sendSMS(phoneNumber, message);
  }

  public async sendShippedSMS(
    cargoTrackingNumber: string,
    phoneNumber: string,
    cargoSupplierName: string,
  ) {
    const message = `Değerli müşterimiz. ${cargoSupplierName} tarafından gönderilen\n${cargoTrackingNumber} takip nolu kargonuz yola çıkmıştır.\n\nKolikargo`;
    return this.userService.sendSMS(phoneNumber, message);
  }

  public async sendDeliveredSMS(
    cargoTrackingNumber: string,
    phoneNumber: string,
    cargoSupplierName: string,
  ) {
    const message = `Değerli müşterimiz. ${cargoSupplierName} tarafından gönderilen\n${cargoTrackingNumber} takip nolu kargonuz teslim edilmiştir. Bizi tercih ettiğiniz için teşekkür ederiz.\n\nKolikargo`;
    return this.userService.sendSMS(phoneNumber, message);
  }
}
