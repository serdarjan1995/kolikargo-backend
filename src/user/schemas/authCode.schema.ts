import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AuthCode extends Document {
  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  code: number;

  @Prop({ required: true })
  expires: Date;
}

export const AuthCodeSchema = SchemaFactory.createForClass(AuthCode);
