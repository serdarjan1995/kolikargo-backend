import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { LoginType } from '../../auth/auth.service';

@Schema()
export class AuthCode extends Document {
  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  code: number;

  @Prop({ required: true })
  expires: Date;

  @Prop({ required: true, default: LoginType.customer })
  type: string;
}

export const AuthCodeSchema = SchemaFactory.createForClass(AuthCode);
