import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './constants';
import { AuthenticatedUser } from '../user/models/user.model';
import { UserService } from '../user/user.service';
import { LoginType } from './auth.service';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
    private cargoSupplierService: CargoSupplierService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any): Promise<AuthenticatedUser> {
    const userFilter = {
      phoneNumber: payload.phoneNumber,
      id: payload.id,
    };
    switch (payload.type) {
      case LoginType.customer:
        userFilter['roles'] = payload.roles;
        await this.userService.getUserBy(userFilter, true, false);
        break;
      case LoginType.supplier:
        await this.cargoSupplierService.getCargoSupplierByFilter(
          userFilter,
          true,
          false,
        );
        break;
    }

    return {
      phoneNumber: payload.phoneNumber,
      id: payload.id,
      roles: payload.roles,
      type: payload.type,
    };
  }
}
