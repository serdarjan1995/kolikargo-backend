import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';

@Schema()
export class User extends Document {
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

  @Prop({ required: true })
  surname: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
