import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobSeekerDocument = JobSeeker & Document;

class Experience {
  company: String;
  position: String;
  years: String;
}

@Schema({ timestamps: true })
export class JobSeeker {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) // ✅ Reference to User instead of storing user details
  user: Types.ObjectId;

  @Prop({ required: false, default: '' }) // ✅ No need to require fields from User schema
  resume?: string;

  @Prop({ default: [] })
  skills?: string[];

  @Prop({ default: [] })
  experience?: Experience[];
}

export const JobSeekerSchema = SchemaFactory.createForClass(JobSeeker);
