// src/upload/pdf.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type PdfDocument = Pdf & Document;

@Schema({ timestamps: true })
export class Pdf {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  filename: string;
  
  @Prop({ default: Date.now() })
  createdDate: Date;
}

export const PdfSchema = SchemaFactory.createForClass(Pdf);
