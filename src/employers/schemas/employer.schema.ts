import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import mongoose from 'mongoose';

export type EmployerDocument = Employer & Document;

@Schema({ timestamps: true })
export class Employer extends User {
  @Prop({ required: true })
  companyName: string;

  @Prop()
  industry?: string;

  @Prop()
  companyDescription?: string;

  @Prop()
  logo?: string; // Company logo URL

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }])
  jobListings: mongoose.Types.ObjectId[];

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'JobSeeker' }])
  shortlistedCandidates: mongoose.Types.ObjectId[];
}

export const EmployerSchema = SchemaFactory.createForClass(Employer);
