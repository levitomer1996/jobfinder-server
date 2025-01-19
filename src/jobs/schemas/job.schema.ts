import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Number })
  salaryRangeMin?: number;

  @Prop({ type: Number })
  salaryRangeMax?: number;

  @Prop({ required: true })
  location: string; // City, country, or remote

  @Prop([String])
  requiredSkills: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true })
  postedBy: mongoose.Types.ObjectId;

  @Prop({ default: 'open', enum: ['open', 'closed'] })
  status: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);
