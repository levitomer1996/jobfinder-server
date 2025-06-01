import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, discriminatorKey: 'role' })
export class User {
  @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  passwordHash?: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ required: true, enum: ['jobseeker', 'employer'] })
  role: string;

  @Prop({ type: Types.ObjectId, ref: 'JobSeeker', required: false })
  jobSeekerProfile?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Employer', required: false })
  employerProfile?: Types.ObjectId;

  @Prop()
  googleId?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  lastLogin?: Date;

  // ✅ New field for profile image URL
  @Prop()
  profileImageUrl?: string;

  @Prop({ enum: ['local', 'google'], default: 'local' })
  authType: 'local' | 'google';
}

export const UserSchema = SchemaFactory.createForClass(User);
