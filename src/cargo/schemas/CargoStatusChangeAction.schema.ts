import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';
import { CARGO_STATUSES } from '../models/cargo.model';

@Schema()
export class CargoStatusChangeAction extends Document {
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
    unique: true,
    enum: CARGO_STATUSES,
  })
  fromStatus: string;

  @Prop({
    required: true,
    enum: CARGO_STATUSES,
    type: [{ type: String }],
  })
  toStatuses: [string];

  @Prop({
    required: true,
    enum: CARGO_STATUSES,
    type: [{ type: String }],
  })
  pastStatuses: [string];

  @Prop({
    required: true,
    enum: CARGO_STATUSES,
    type: [{ type: String }],
  })
  nextDisabledStatuses: [string];

  @Prop({
    required: false,
    type: Object,
    default: null,
  })
  confirmationMessages: object | null;
}

export const CargoStatusChangeActionSchema = SchemaFactory.createForClass(
  CargoStatusChangeAction,
);
