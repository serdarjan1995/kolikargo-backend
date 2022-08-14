import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';

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
    type: String,
  })
  cargoType: string;

  @Prop({
    required: true,
    type: String,
  })
  cargoMethod: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'CargoSupplier',
  })
  supplier: Types.ObjectId;

  @Prop({ required: true })
  price: number;
}

export const CargoPricingSchema = SchemaFactory.createForClass(CargoPricing);
