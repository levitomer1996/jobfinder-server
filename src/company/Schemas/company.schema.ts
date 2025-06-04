import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type CompanyDocument = Company & Document;
//Fixed for Render
@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  profileImage: string;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employer' }],
    default: [],
  })
  recruiters: Types.ObjectId[];
}

export const CompanySchema = SchemaFactory.createForClass(Company);
