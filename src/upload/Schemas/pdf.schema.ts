// src/upload/pdf.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { ResumeBase } from './resume.abstractschema';

export type PdfDocument = Pdf & Document;

@Schema({ timestamps: true })
export class Pdf extends ResumeBase {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  filename: string;
}

export const PdfSchema = SchemaFactory.createForClass(Pdf);
