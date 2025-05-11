// src/chat/dto/GetChatsByUserId.dto.ts
import { Types } from 'mongoose';
import { Chat } from '../schemas/chat.schema';
import { User } from 'src/users/schemas/user.schema';

class GetChatsByUserId {
  chat: Chat; // ✅ singular and matches returned object
  otherParticipant: { _id: Types.ObjectId; name: string; email: string };
}

export default GetChatsByUserId;
