import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, efault: () => new Types.ObjectId() })
  _id: Types.ObjectId;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  senderId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  receiverId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 'sent', enum: ['sent', 'read'] })
  status: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
