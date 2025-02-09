import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, discriminatorKey: 'role' })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ required: true, enum: ['jobseeker', 'employer'] })
  role: string;

  @Prop({ type: Types.ObjectId, ref: 'JobSeeker', required: false })
  jobSeekerProfile?: Types.ObjectId; // ✅ Reference to JobSeeker Schema

  @Prop({ type: Types.ObjectId, ref: 'Employer', required: false })
  employerProfile?: Types.ObjectId; // ✅ Reference to Employer Schema

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
