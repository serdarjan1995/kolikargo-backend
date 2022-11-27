import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';
import { CARGO_TYPES } from '../models/cargoType.model';

@Schema()
export class CargoTypeIcon extends Document {
  @Prop({
    required: true,
    type: String,
  })
  white: string;

  @Prop({
    required: true,
    type: String,
  })
  dark: string;
}

export const CargoTypeIconSchema = SchemaFactory.createForClass(CargoTypeIcon);

@Schema({
  strict: false,
})
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
    unique: true,
    enum: CARGO_TYPES,
  })
  name: string;

  @Prop({
    required: true,
    type: CargoTypeIconSchema,
  })
  icons: typeof CargoTypeIconSchema;

  @Prop({ required: true, type: {} })
  translations: object;

  @Prop({ required: false })
  order: number;

  @Prop({
    type: Boolean,
    default: false,
  })
  hasSubType: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  isSubType: boolean;

  @Prop({
    required: false,
    type: MongooseSchema.Types.ObjectId,
    ref: 'CargoType',
  })
  parent: Types.ObjectId;
}

export const CargoTypeSchema = SchemaFactory.createForClass(CargoType);
