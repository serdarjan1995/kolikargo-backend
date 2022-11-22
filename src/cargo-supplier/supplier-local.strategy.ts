import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CargoSupplierService } from './cargo-supplier.service';

@Injectable()
export class SupplierLocalStrategy extends PassportStrategy(
  Strategy,
  'supplier-local',
) {
  constructor(private cargoSupplierService: CargoSupplierService) {
    super({ usernameField: 'phoneNumber', passwordField: 'authCode' });
  }

  async validate(phoneNumber: string, authCode: number): Promise<any> {
    const cargoSupplier = await this.cargoSupplierService.validateCargoSupplier(
      phoneNumber,
      authCode,
    );

    if (!cargoSupplier) {
      throw new UnauthorizedException();
    }
    await this.cargoSupplierService.expireAuthCode(phoneNumber);
    return cargoSupplier;
  }
}
