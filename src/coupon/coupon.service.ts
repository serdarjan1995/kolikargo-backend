import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CouponModel,
  COUPON_TYPES,
  CreateCouponModel,
  ValidateCouponModel,
} from './models/coupon.model';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';
import { UserModel } from '../user/models/user.model';
import { CargoService } from '../cargo/cargo.service';
import { CARGO_STATUSES } from '../cargo/models/cargo.model';
import { UserService } from '../user/user.service';

const CouponModelProjection = {
  _id: false,
  __v: false,
};

@Injectable()
export class CouponService {
  constructor(
    @InjectModel('Coupon')
    private readonly couponModel: Model<CouponModel>,
    private readonly cargoSupplierService: CargoSupplierService,
    private readonly cargoService: CargoService,
    private readonly userService: UserService,
  ) {}

  public populateFields = [
    {
      path: 'supplier',
      select: 'id name description avatarUrl',
    },
  ];

  public async getCoupons(filter: object): Promise<CouponModel[]> {
    return await this.couponModel
      .find(filter, CouponModelProjection)
      .populate(this.populateFields)
      .exec();
  }

  public async createCoupon(
    newCoupon: CreateCouponModel,
  ): Promise<CouponModel> {
    const existingCoupon = await this.getCoupons({
      code: {
        $regex: new RegExp('^' + newCoupon.code, 'i'),
      },
      title: {
        $regex: new RegExp('^' + newCoupon.title, 'i'),
      },
    });

    if (newCoupon.type == COUPON_TYPES.COMPANY) {
      newCoupon.supplier = await this.cargoSupplierService.idToObjectId(
        newCoupon.supplier,
      );
    } else {
      newCoupon.supplier = null;
    }

    if (existingCoupon.length) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Coupon code or title already exists, please check entries',
          errorCode: 'already_exists',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const coupon = await this.couponModel.create(newCoupon);
    await coupon.validate();
    await coupon.save();
    return this.getCoupon(coupon.id);
  }

  public async getCoupon(
    id: string,
    noProjection = false,
  ): Promise<CouponModel> {
    const coupon = await this.couponModel
      .findOne({ id: id }, noProjection ? null : CouponModelProjection)
      .populate(this.populateFields)
      .exec();
    if (!coupon) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Coupon Not Found',
          errorCode: 'coupon_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return coupon;
  }

  public async updateCoupon(
    id: string,
    updateParams: any,
  ): Promise<CouponModel> {
    delete updateParams.id;
    const coupon = await this.couponModel
      .findOneAndUpdate({ id: id }, updateParams)
      .exec();
    if (!coupon) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Coupon Not Found',
          errorCode: 'coupon_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return this.getCoupon(coupon.id);
  }

  public async deleteCoupon(id): Promise<any> {
    const coupon = await this.couponModel.deleteOne({ id: id });
    if (!coupon.deletedCount) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Coupon Not Found',
          errorCode: 'coupon_not_found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return coupon;
  }

  public async validateCoupon(
    coupon: ValidateCouponModel,
    userId: string,
  ): Promise<CouponModel> {
    const userObjectId = await this.userService.idToObjectId(userId);
    const couponUsedInCargo = await this.cargoService.getCargoByFiler(
      {
        user: userObjectId,
        usedCoupon: coupon.code,
        status: { $nin: [CARGO_STATUSES.REJECTED, CARGO_STATUSES.CANCELLED] },
      },
      false,
      false,
    );
    // find universal coupon and check validity
    const universalCoupons = await this.getCoupons({
      type: COUPON_TYPES.UNIVERSAL,
      code: coupon.code,
    });
    if (universalCoupons.length) {
      const validCoupon: CouponModel = universalCoupons[0];
      if (validCoupon.expires && validCoupon.expires < new Date()) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Coupon Expired',
            errorCode: 'coupon_expired',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      //check coupon for multipleUse
      if (
        validCoupon?.multipleUse ||
        (!validCoupon?.multipleUse && !couponUsedInCargo)
      ) {
        return validCoupon;
      }
    }

    // find company coupon and check validity
    const filter = {
      ...coupon,
    };
    if (filter?.supplier) {
      filter.supplier = await this.cargoSupplierService.idToObjectId(
        filter.supplier,
      );
    }
    const companyCoupons = await this.getCoupons(filter);
    if (companyCoupons.length) {
      const validCoupon: CouponModel = companyCoupons[0];
      if (
        (validCoupon.supplier &&
          validCoupon.supplier?.id !== coupon.supplier) ||
        (validCoupon.expires && validCoupon.expires < new Date())
      ) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Coupon Not Found',
            errorCode: 'coupon_not_found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      //check coupon for multipleUse
      if (
        validCoupon?.multipleUse ||
        (!validCoupon?.multipleUse && !couponUsedInCargo)
      ) {
        return validCoupon;
      }
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Coupon Not Found',
        errorCode: 'coupon_not_found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
