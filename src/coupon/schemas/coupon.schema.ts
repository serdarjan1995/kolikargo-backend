import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';
import { COUPON_DISCOUNT_TYPES, COUPON_TYPES } from '../models/coupon.model';

@Schema()
export class Coupon extends Document {
  @Prop({
    type: String,
    unique: true,
    default: function genUUID() {
      return uuidV4();
    },
  })
  id: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true, default: COUPON_TYPES.UNIVERSAL })
  type: string;

  @Prop({ required: true, default: COUPON_DISCOUNT_TYPES.FIXED })
  discountType: string;

  @Prop({ required: true })
  discountValue: number;

  @Prop({ required: false })
  minWeight: number;

  @Prop({ required: false })
  expires: Date;

  @Prop({
    required: false,
    type: MongooseSchema.Types.ObjectId,
    ref: 'CargoSupplier',
  })
  supplier: Types.ObjectId;

  @Prop({ required: false, default: false })
  multipleUse: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
