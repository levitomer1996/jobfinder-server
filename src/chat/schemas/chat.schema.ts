import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import mongoose from 'mongoose';

export type ChatDocument = Chat & Document;

export enum ChatType {
  SYSTEM = 'system',
  PRIVATE = 'private',
}

@Schema({ timestamps: true })
export class Chat {
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: true,
  })
  participants: Types.ObjectId[]; // [user1, user2]

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    default: [],
  })
  messages: Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null })
  lastMessage: Types.ObjectId | null;

  @Prop({
    type: String,
    enum: ChatType,
    default: ChatType.PRIVATE,
  })
  type: ChatType;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
