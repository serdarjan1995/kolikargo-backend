import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { CouponModel } from './models/coupon.model';

@Controller('coupon')
export class CouponController {
  constructor(private couponService: CouponService) {}

  @Get()
  @Roles(Role.User)
  public async getCoupons(@Query() query) {
    const name = query.name;
    const filter = {
      title: { $regex: `.*${name}.*`, $options: 'i' },
    };
    return await this.couponService.getCoupons({ filter });
  }

  @Post()
  @Roles(Role.Admin)
  public createCoupon(@Request() req, @Body() coupon: CouponModel) {
    return this.couponService.createCoupon(coupon);
  }

  @Get(':id')
  @Roles(Role.User)
  public async getCouponById(@Param('id') id: string) {
    return this.couponService.getCoupon(id);
  }

  @Put(':id')
  @Roles(Role.Admin)
  public async updateCoupon(
    @Param('id') id: string,
    @Body() coupon: CouponModel,
  ) {
    return this.couponService.updateCoupon(id, coupon);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  public async deleteCoupon(@Param('id') id: string) {
    return this.couponService.deleteCoupon(id);
  }
}
