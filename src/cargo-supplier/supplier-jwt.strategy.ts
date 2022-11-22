import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { jwtConstants } from '../auth/constants';
import { CargoSupplierService } from './cargo-supplier.service';
import { AuthenticatedCargoSupplier } from './models/cargoSupplier.model';

@Injectable()
export class SupplierJwtStrategy extends PassportStrategy(Strategy, 'supplier-jwt') {
  constructor(private cargoSupplierService: CargoSupplierService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any): Promise<AuthenticatedCargoSupplier> {
    const supplierFilter = {
      phoneNumber: payload.phoneNumber,
      id: payload.supplierId,
      roles: payload.roles,
    };

    const cargoSupplier =
      await this.cargoSupplierService.getCargoSupplierByFilter(supplierFilter);
    if (!cargoSupplier) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Cargo Supplier Not Found Auth error',
          errorCode: 'cargo_supplier_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      phoneNumber: payload.phoneNumber,
      supplierId: payload.supplierId,
      roles: payload.roles,
    };
  }
}
