import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CouponModel,
  CouponType,
  CreateCouponModel,
  ValidateCouponModel,
} from './models/coupon.model';
import { CargoSupplierService } from '../cargo-supplier/cargo-supplier.service';

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

    if (newCoupon.type == CouponType.COMPANY) {
      newCoupon.supplier = await this.cargoSupplierService.idToObjectId(
        newCoupon.supplier,
      );
    }

    if (existingCoupon.length) {
      throw new HttpException(
        'Coupon code or title already exists, please check entries',
        400,
      );
    }

    const coupon = await this.couponModel.create(newCoupon);
    await coupon.validate();
    await coupon.save();
    return this.getCoupon(coupon.id);
  }

  public async getCoupon(id): Promise<CouponModel> {
    const coupon = await this.couponModel
      .findOne({ id: id }, CouponModelProjection)
      .populate(this.populateFields)
      .exec();
    if (!coupon) {
      throw new HttpException('Not Found', 404);
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
      throw new HttpException('Not Found', 404);
    }
    return this.getCoupon(coupon.id);
  }

  public async deleteCoupon(id): Promise<any> {
    const coupon = await this.couponModel.deleteOne({ id: id });
    if (!coupon.deletedCount) {
      throw new HttpException('Not Found', 404);
    }
    return coupon;
  }

  public async validateCoupon(coupon: ValidateCouponModel): Promise<any> {
    const filter = {
      ...coupon,
      expires: {
        $gte: new Date(),
      },
    };
    if (filter?.supplier) {
      filter.supplier = await this.cargoSupplierService.idToObjectId(
        filter.supplier,
      );
    }
    const coupons = await this.getCoupons(filter);
    if (!coupons.length) {
      throw new HttpException('Not Found', 404);
    }

    const validCoupon: CouponModel = coupons[0];
    if (validCoupon.supplier && validCoupon.supplier?.id !== coupon.supplier) {
      throw new HttpException('Not Found', 404);
    }

    return validCoupon;
  }
}
