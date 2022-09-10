import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';
import {
  CARGO_METHODS,
  CARGO_TYPES,
} from '../../cargo-pricing/models/cargoPricing.model';
import { CARGO_STATUSES } from '../models/cargo.model';
import { UserAddressDetailSchema } from '../../user-address/schemas/userAddress.schema';
import { format } from 'date-fns';

const getRandomStr = (length) => {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const generateTrackingNumber = () => {
  const dateStr = format(new Date(), 'ddMMyy');
  return `${dateStr}${getRandomStr(4)}`;
};

@Schema()
export class Cargo extends Document {
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
    type: String,
    enum: CARGO_STATUSES,
  })
  status: string;

  @Prop({
    required: true,
    type: Number,
  })
  weight: number;

  @Prop({
    required: true,
    type: String,
    enum: CARGO_TYPES,
  })
  cargoType: string;

  @Prop({
    required: true,
    type: String,
    enum: CARGO_METHODS,
  })
  cargoMethod: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Location',
  })
  sourceLocation: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Location',
  })
  destinationLocation: string;

  @Prop({
    required: true,
    type: UserAddressDetailSchema,
  })
  pickupAddress: [typeof UserAddressDetailSchema];

  @Prop({
    required: true,
    type: Date,
  })
  pickupDate: Date;

  @Prop({
    required: false,
    type: String,
  })
  pickupTime: string;

  @Prop({
    required: true,
    type: UserAddressDetailSchema,
  })
  deliveryAddress: [typeof UserAddressDetailSchema];

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'CargoSupplier',
  })
  supplier: Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  user: Types.ObjectId;

  @Prop({
    required: false,
    type: String,
  })
  note: string;

  @Prop({
    required: false,
    type: String,
  })
  usedCoupon: string;

  @Prop({ required: true })
  fee: number;

  @Prop({ required: true })
  service_fee: number;

  @Prop({ required: true })
  total_fee: number;

  @Prop({ required: true })
  estimatedDeliveryDate: Date;

  @Prop({ required: false })
  deliveredDate: Date;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({
    type: String,
    unique: true,
    default: generateTrackingNumber,
  })
  trackingNumber: string;
}

export const CargoSchema = SchemaFactory.createForClass(Cargo);
