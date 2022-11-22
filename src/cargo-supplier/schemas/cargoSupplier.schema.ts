import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';
import { Role } from '../../auth/role.enum';

@Schema()
export class CargoSupplier extends Document {
  @Prop({
    type: String,
    unique: true,
    default: function genUUID() {
      return uuidV4();
    },
  })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: false, default: '' })
  description: string;

  @Prop({ required: false, default: 0, max: 5, min: 0 })
  stars: number;

  @Prop({ required: false, default: 0 })
  reviewsCount: number;

  @Prop({ type: [], default: [] })
  reviews: [Types.ObjectId];

  @Prop({ required: true, min: 0 })
  minWeight: number;

  @Prop({ required: false, min: 0, default: 0 })
  minPrice: number;

  @Prop({ required: false, default: 0, min: 0 })
  deliveryEstimationMin: number;

  @Prop({ required: false, default: 0, min: 0 })
  deliveryEstimationMax: number;

  @Prop({ required: false, default: true })
  freePackaging: boolean;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  user: Types.ObjectId;

  @Prop({ required: false, default: false })
  featured: boolean;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Location' }] })
  serviceSourceLocations: [Types.ObjectId];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Location' }] })
  serviceDestinationLocations: [Types.ObjectId];

  @Prop({ required: true })
  avatarUrl: string;

  @Prop({ required: false })
  publicAuthToken: string;

  @Prop({ required: true })
  roles: Role[];
}

export const CargoSupplierSchema = SchemaFactory.createForClass(CargoSupplier);
