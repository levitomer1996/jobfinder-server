import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type InterviewDocument = Interview & Document;

@Schema({ timestamps: true })
export class Interview {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true })
  jobId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: true,
  })
  jobSeekerId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true,
  })
  employerId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  dateTime: Date;

  @Prop({ default: 'scheduled', enum: ['scheduled', 'completed', 'canceled'] })
  status: string;
}

export const InterviewSchema = SchemaFactory.createForClass(Interview);
