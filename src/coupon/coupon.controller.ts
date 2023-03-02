import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import {
  CouponModel,
  CreateCouponModel,
  ValidateCouponModel,
} from './models/coupon.model';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('coupon')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('coupon')
export class CouponController {
  constructor(private couponService: CouponService) {}

  @Get()
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CouponModel,
    isArray: true,
  })
  @ApiQuery({
    name: 'title',
    required: false,
    description: 'filter by title',
  })
  public async getCoupons(@Query() query) {
    const title = query.title;
    const filter = {
      title: { $regex: `.*${title}.*`, $options: 'i' },
    };
    return await this.couponService.getCoupons({ filter });
  }

  @Post()
  @Roles(Role.Admin)
  @ApiCreatedResponse({
    description: 'Successful Response',
    type: CouponModel,
  })
  public createCoupon(@Request() req, @Body() coupon: CreateCouponModel) {
    return this.couponService.createCoupon(coupon);
  }

  @Get(':id')
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CouponModel,
  })
  public async getCouponById(@Param('id') id: string) {
    return this.couponService.getCoupon(id);
  }

  @Put(':id')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CouponModel,
  })
  public async updateCoupon(
    @Param('id') id: string,
    @Body() coupon: CouponModel,
  ) {
    return this.couponService.updateCoupon(id, coupon);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOkResponse({
    description: 'Successful Response',
  })
  public async deleteCoupon(@Param('id') id: string) {
    return this.couponService.deleteCoupon(id);
  }

  @Post('validate')
  @Roles(Role.User)
  @ApiOkResponse({
    description: 'Successful Response',
    type: CouponModel,
  })
  @ApiNotFoundResponse({
    description: 'Not found response',
  })
  @HttpCode(200)
  public async validateCoupon(
    @Request() req,
    @Body() coupon: ValidateCouponModel,
  ) {
    return this.couponService.validateCoupon(coupon, req.user.id);
  }
}
