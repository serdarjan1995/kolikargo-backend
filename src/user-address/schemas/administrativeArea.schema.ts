import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AdministrativeArea extends Document {
  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: false })
  parent: string;

  @Prop({ required: false })
  parentCategory: string;

  @Prop({ required: false })
  child: string;

  @Prop({ required: false })
  childCategory: string;

  @Prop({ required: false })
  code: string;
}

export const AdministrativeAreaSchema =
  SchemaFactory.createForClass(AdministrativeArea);
