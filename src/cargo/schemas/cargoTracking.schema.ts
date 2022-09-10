import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';
import { CARGO_STATUSES } from '../models/cargo.model';

@Schema()
export class CargoTracking extends Document {
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

  @Prop({ required: true })
  datetime: Date;

  @Prop({
    required: false,
    type: String,
  })
  note: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Cargo',
  })
  cargo: Types.ObjectId;
}

export const CargoTrackingSchema = SchemaFactory.createForClass(CargoTracking);
