// src/upload/profile-image.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type ProfileImageDocument = ProfileImage & Document;

@Schema({ timestamps: true })
export class ProfileImage {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
  @Prop({ required: true })
  token: string;
  @Prop({ required: true })
  filename: string;
}

export const ProfileImageSchema = SchemaFactory.createForClass(ProfileImage);
