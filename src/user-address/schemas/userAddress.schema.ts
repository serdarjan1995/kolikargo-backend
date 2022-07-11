import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';

@Schema()
export class UserAddress extends Document {
  @Prop({
    type: String,
    unique: true,
    default: function genUUID() {
      return uuidV4();
    },
  })
  id: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  isDefault: boolean;

  @Prop({ required: true })
  contactName: string;

  @Prop({ required: true })
  contactSurname: string;

  @Prop({ required: true })
  contactPhoneNumber: string;

  @Prop({ required: false })
  country: string;

  @Prop({ required: false })
  province: string;

  @Prop({ required: false })
  city: string;

  @Prop({ required: false })
  district: string;

  @Prop({ required: false })
  houseNo: string;

  @Prop({ required: false })
  floorNo: string;

  @Prop({ required: false })
  doorNo: string;

  @Prop({ required: false })
  addressLine: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  user: Types.ObjectId;
}

export const UserAddressSchema = SchemaFactory.createForClass(UserAddress);
