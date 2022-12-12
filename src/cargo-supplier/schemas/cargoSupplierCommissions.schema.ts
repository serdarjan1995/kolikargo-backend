import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { COMMISSION_TYPES } from '../models/cargoSupplierCommissions.model';

@Schema()
export class CommissionType extends Document {
  @Prop({
    required: true,
    type: String,
    enum: COMMISSION_TYPES,
  })
  type: string;

  @Prop({
    required: true,
    type: Number,
  })
  value: number;

  @Prop({
    required: true,
    type: Number,
    default: 1,
  })
  minRange: number;

  @Prop({
    required: true,
    type: Number,
    default: 9999,
  })
  maxRange: number;
}

export const CommissionTypeSchema =
  SchemaFactory.createForClass(CommissionType);

@Schema()
export class CargoSupplierCommissions extends Document {
  @Prop({
    required: true,
    unique: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'CargoSupplier',
  })
  supplier: Types.ObjectId;

  @Prop({
    required: true,
    type: [{ type: CommissionTypeSchema }],
  })
  perItemCommission: [typeof CommissionTypeSchema];

  @Prop({
    required: true,
    type: [{ type: CommissionTypeSchema }],
  })
  perWeightCommission: [typeof CommissionTypeSchema];
}

export const CargoSupplierCommissionSchema = SchemaFactory.createForClass(
  CargoSupplierCommissions,
);
