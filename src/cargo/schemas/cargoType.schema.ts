import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';
import { CARGO_TYPES } from '../../cargo-pricing/models/cargoPricing.model';

@Schema()
export class CargoType extends Document {
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
    enum: CARGO_TYPES,
  })
  name: string;

  @Prop({ required: true, type: {} })
  translations: object;
}

export const CargoTypeSchema = SchemaFactory.createForClass(CargoType);
