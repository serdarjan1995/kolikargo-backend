import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';
import { CARGO_METHODS, CARGO_TYPES } from '../models/cargoPricing.model';

@Schema()
export class CargoPriceField extends Document {
  @Prop({
    required: true,
    type: String,
    enum: CARGO_TYPES,
  })
  cargoType: string;

  @Prop({ required: true })
  price: number;
}

export const CargoPriceFieldSchema =
  SchemaFactory.createForClass(CargoPriceField);

@Schema()
export class CargoPricing extends Document {
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
    type: [{ type: CargoPriceFieldSchema }],
  })
  prices: [typeof CargoPriceFieldSchema];

  @Prop({
    required: true,
    type: String,
    enum: CARGO_METHODS,
  })
  cargoMethod: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'CargoSupplier',
  })
  supplier: Types.ObjectId;

  @Prop({
    required: true,
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Location' }],
  })
  locations: [Types.ObjectId];
}

export const CargoPricingSchema = SchemaFactory.createForClass(CargoPricing);
