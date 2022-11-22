import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from '../user/models/user.model';
import { CargoSupplierModel } from '../cargo-supplier/models/cargoSupplier.model';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';

export enum LoginType {
  supplier = 'supplier',
  customer = 'customer',
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private cargoSupplierService: CargoSupplierService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    phoneNumber: string,
    authCode: number,
    type = LoginType.customer,
  ): Promise<any> {
    let user: CargoSupplierModel | UserModel;
    switch (type) {
      case LoginType.customer:
        user = await this.userService.getUserBy(
          { phoneNumber: phoneNumber },
          true,
          false,
        );
        break;
      case LoginType.supplier:
        user = await this.cargoSupplierService.getCargoSupplierByFilter(
          { phoneNumber: phoneNumber },
          true,
          false,
        );
        break;
    }

    if (!user) {
      return null;
    }
    const auth = await this.userService.getAuthCode(phoneNumber);
    if (!auth) {
      return null;
    }
    if (auth.code != authCode) {
      return null;
    }
    return user;
  }

  async expireAuthCode(phoneNumber: string): Promise<any> {
    await this.userService.expireAuthCode(phoneNumber);
  }

  async login(user: UserModel) {
    const payload = {
      phoneNumber: user.phoneNumber,
      id: user.id,
      roles: user.roles,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
