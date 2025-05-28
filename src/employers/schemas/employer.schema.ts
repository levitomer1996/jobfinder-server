import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployerDocument = Employer & Document;

@Schema({ timestamps: true })
export class Employer {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true }) // ✅ Reference by ID
  company: Types.ObjectId;

  @Prop()
  website?: string;

  @Prop({ type: [Types.ObjectId], default: [] })
  jobPostings?: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], default: [] })
  reviews?: Types.ObjectId[];
}

export const EmployerSchema = SchemaFactory.createForClass(Employer);
