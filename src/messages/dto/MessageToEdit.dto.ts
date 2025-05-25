import { Types } from 'mongoose';

export class MessageToEdit {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  status: 'sent' | 'read';
  createdAt: string;
  updatedAt: string;
}
