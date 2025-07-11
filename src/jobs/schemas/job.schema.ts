import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';
import { Company } from 'src/company/schemas/company.schema';
import { Skill } from 'src/skill/schemas/skill.schema';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  location: string; // City, country, or remote

  @Prop({ default: [] })
  requiredSkills: Skill[];

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: mongoose.Types.ObjectId;
  @Prop({ required: true })
  companyName: string;
  @Prop({ type: Types.ObjectId, ref: 'Employer', required: true })
  postedBy: mongoose.Types.ObjectId;

  @Prop({ default: 'open', enum: ['open', 'closed'] })
  status: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Application' })
  applicants: mongoose.Types.ObjectId[];

  // ✅ New Field: Job Type
  @Prop({ required: true, enum: ['full-time', 'part-time'] })
  jobType: 'full-time' | 'part-time';
}

export const JobSchema = SchemaFactory.createForClass(Job);
