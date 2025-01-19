import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import mongoose from 'mongoose';

export type JobSeekerDocument = JobSeeker & Document;

@Schema({ timestamps: true })
export class JobSeeker extends User {
  @Prop()
  resume?: string; // File path or URL

  @Prop([String])
  experience: string[]; // List of past jobs

  @Prop([String])
  skills: string[];

  @Prop([String])
  education: string[];

  @Prop({ type: Object })
  preferences: {
    jobType?: string; // e.g., Full-time, Remote
    salaryRange?: { min: number; max: number };
  };

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }])
  appliedJobs: mongoose.Types.ObjectId[];
}

export const JobSeekerSchema = SchemaFactory.createForClass(JobSeeker);
