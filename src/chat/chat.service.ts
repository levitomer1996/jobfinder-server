import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { Model, Types } from 'mongoose';
import { MessagesService } from 'src/messages/messages.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(
    @InjectModel(Chat.name)
    private chatModel: Model<ChatDocument>,
    private messageService: MessagesService,
  ) {}

  async create(
    creatorId: Types.ObjectId,
    receiverId: Types.ObjectId,
    message: string,
  ): Promise<Chat> {
    this.logger.log(
      `Attempting to create message from ${creatorId} to ${receiverId}`,
    );

    try {
      // 1. ✅ Create the first message
      const newMessage = await this.messageService.createMessage(
        creatorId,
        receiverId,
        message,
      );

      // 2. ✅ Then create the chat and include participants
      const newChat = new this.chatModel({
        participants: [creatorId, receiverId],
        messages: [newMessage._id],
      });

      await newChat.save();

      this.logger.log(
        `Successfully created chat and first message between ${creatorId} and ${receiverId}`,
      );

      return newChat;
    } catch (error) {
      this.logger.error(
        `Failed to create chat and message: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Failed to create chat and message',
      );
    }
  }

  async getMessagesBetweenParticipants(
    userId1: Types.ObjectId,
    userId2: Types.ObjectId,
  ) {
    try {
      this.logger.log(`Fetching messages between ${userId1} and ${userId2}`);
      const messages = await this.messageService.getMessagesBetweenUsers(
        userId1,
        userId2,
      );
      return messages;
    } catch (error) {
      this.logger.error(
        `Failed to fetch messages: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve messages');
    }
  }
}
