import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async createMessage(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId,
    content: string,
  ): Promise<Message> {
    try {
      const newMessage = new this.messageModel({
        senderId,
        receiverId,
        content,
        status: 'sent',
      });

      await newMessage.save();
      this.logger.log(`Message sent from ${senderId} to ${receiverId}`);
      return newMessage;
    } catch (error) {
      this.logger.error('Error creating message', error.stack);
      throw new InternalServerErrorException('Failed to create message');
    }
  }
  async getMessagesBetweenUsers(
    userId1: Types.ObjectId,
    userId2: Types.ObjectId,
  ): Promise<Message[]> {
    try {
      this.logger.log(`Fetching messages between ${userId1} and ${userId2}`);

      const messages = await this.messageModel
        .find({
          $or: [
            { senderId: userId1, receiverId: userId2 },
            { senderId: userId2, receiverId: userId1 },
          ],
        })
        .sort({ createdAt: 1 }); // sorted by oldest to newest

      return messages;
    } catch (error) {
      this.logger.error('Error fetching messages', error.stack);
      throw new InternalServerErrorException('Failed to fetch messages');
    }
  }
}
