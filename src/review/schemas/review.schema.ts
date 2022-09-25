import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { v4 as uuidV4 } from 'uuid';

@Schema()
export class ReviewAttachment extends Document {
  @Prop({
    required: true,
  })
  link: string;
}

export const ReviewAttachmentSchema =
  SchemaFactory.createForClass(ReviewAttachment);

@Schema()
export class Review extends Document {
  @Prop({
    type: String,
    unique: true,
    default: function genUUID() {
      return uuidV4();
    },
  })
  id: string;

  @Prop({
    required: false,
    default: null,
  })
  text: string | null;

  @Prop({
    required: true,
    type: Number,
    min: 0,
    max: 10,
  })
  stars: number;

  @Prop({
    required: false,
    type: [{ type: ReviewAttachmentSchema }],
  })
  attachments: [typeof ReviewAttachmentSchema];

  @Prop({
    required: false,
    type: Boolean,
    default: false,
  })
  verified: boolean;

  @Prop({
    required: false,
    default: null,
  })
  parent: string | null;

  @Prop({
    required: false,
    type: Number,
    default: 0,
  })
  replies: number;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
  })
  user: Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'CargoSupplier',
  })
  supplier: Types.ObjectId;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Cargo',
  })
  relatedCargo: Types.ObjectId;

  @Prop({
    required: true,
    default: true,
  })
  hideName: boolean;

  @Prop({
    required: true,
    default: '*** ***',
    type: String,
  })
  authorName: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
