import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployerDocument = Employer & Document;

@Schema({ timestamps: true })
export class Employer {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) // ✅ Reference to User instead of storing user details
  user: Types.ObjectId;

  @Prop({ required: true }) // ✅ Company Name
  companyName: string;

  @Prop({ required: false }) // ✅ Company Website (Optional)
  website?: string;

  @Prop({ default: [] }) // ✅ Job Postings (Array of Job IDs)
  jobPostings?: Types.ObjectId[];

  @Prop({ default: [] }) // ✅ Reviews Received (Array of Review IDs)
  reviews?: Types.ObjectId[];
}

export const EmployerSchema = SchemaFactory.createForClass(Employer);
