import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;
  @Prop()
  profileImage: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  recruiters: Types.ObjectId[];
}

export const CompanySchema = SchemaFactory.createForClass(Company);
