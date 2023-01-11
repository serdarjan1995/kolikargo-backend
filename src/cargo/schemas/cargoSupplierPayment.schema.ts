import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';
import { PAYMENT_STATUS } from '../models/cargoSupplierPayment.model';

@Schema()
export class CargoSupplierPayment extends Document {
  @Prop({
    type: String,
    unique: true,
    default: function genUUID() {
      return uuidV4();
    },
  })
  id: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'CargoSupplier',
  })
  supplier: Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Cargo',
  })
  cargo: Types.ObjectId;

  @Prop({ required: true })
  datetime: Date;

  @Prop({ required: false })
  period: Date;

  @Prop({ required: true })
  revenue: number;

  @Prop({ required: true })
  profit: number;

  @Prop({ required: true })
  supplierCommission: number;

  @Prop({ required: true })
  customerCommission: number;

  @Prop({ required: true })
  commission: number;

  @Prop({
    required: true,
    type: String,
    enum: PAYMENT_STATUS,
  })
  paymentStatus: string;
}

export const CargoSupplierPaymentSchema =
  SchemaFactory.createForClass(CargoSupplierPayment);
