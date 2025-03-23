import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

export type ApplicationDocument = Application & Document;

@Schema({ timestamps: true })
export class Application {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true })
  jobId: mongoose.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobSeeker',
    required: true,
  })
  jobSeekerId: mongoose.Types.ObjectId;

  @Prop()
  resume?: string;

  @Prop()
  coverLetter?: string;

  @Prop({ default: 'pending', enum: ['pending', 'reviewed'] })
  status: string;

  @Prop({ default: Date.now })
  appliedAt: Date;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
