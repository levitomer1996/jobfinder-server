import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { Model, Types } from 'mongoose';
import { MessagesService } from 'src/messages/messages.service';
import { UsersService } from 'src/users/users.service';
import GetChatsByUserId from './dto/GetChatsByUserId.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(
    @InjectModel(Chat.name)
    private chatModel: Model<ChatDocument>,
    private messageService: MessagesService,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
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
  async getChatsByUserId(userId: Types.ObjectId): Promise<GetChatsByUserId[]> {
    try {
      const foundChats = await this.chatModel
        .find({ participants: { $in: [userId] } })
        .sort({ updatedAt: -1 }) // ✅ Most recently updated first
        .populate('participants')
        .populate('lastMessage')
        .populate('messages')
        .exec();

      const arrayToReturn: GetChatsByUserId[] = [];

      for (let i = 0; i < foundChats.length; i++) {
        const chat = foundChats[i];

        const otherParticipant = chat.participants.find(
          (p) => p._id.toString() !== userId.toString(),
        );

        if (!otherParticipant) {
          this.logger.warn(`No other participant found in chat ${chat._id}`);
          continue;
        }

        const foundUser = await this.userService.getUserById(
          otherParticipant._id,
        );
        const check = {
          _id: foundUser._id,
          name: foundUser.name,
          email: foundUser.email,
          profileImageUrl: foundUser.profileImageUrl,
        };

        arrayToReturn.push({
          otherParticipant: {
            _id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
            profileImageUrl: foundUser.profileImageUrl,
          },
          chat,
        });
      }

      return arrayToReturn;
    } catch (error) {
      this.logger.error(
        `Failed to fetch chats for user ${userId}`,
        error.stack || error.message,
      );
      throw new InternalServerErrorException('Could not fetch chats');
    }
  }

  async sendMessage(
    senderId: Types.ObjectId,
    receiverId: Types.ObjectId,
    chatId: Types.ObjectId,
    content: string,
  ) {
    try {
      this.logger.log(
        `Creating message from ${senderId} to ${receiverId} in chat ${chatId}`,
      );

      const message = await this.messageService.createMessage(
        senderId,
        receiverId,
        content,
      );

      const updatedChat = await this.chatModel.findByIdAndUpdate(
        chatId,
        {
          $push: { messages: message._id },
          lastMessage: message._id,
        },
        { new: true },
      );

      if (!updatedChat) {
        this.logger.warn(`Chat ${chatId} not found.`);
        throw new Error(`Chat with ID ${chatId} not found.`);
      }

      this.logger.log(`Message ${message._id} added to chat ${chatId}`);
      return message;
    } catch (error) {
      this.logger.error(
        `Failed to send message: ${error.message}`,
        error.stack,
      );
      throw new Error('Failed to send message');
    }
  }
  async markMessagesAsRead(messageIds: Types.ObjectId[]) {
    return await this.messageService.markMessageAsRead(messageIds);
  }
  async getUnreadedChatByUserId(userId: Types.ObjectId): Promise<Chat[]> {
    // Step 1: Find all chats where the user participates
    const chats = await this.chatModel
      .find({ participants: userId })
      .populate('lastMessage');

    // Step 2: Filter chats where the last message is from another user and is still 'sent'
    const unreadChats = chats.filter((chat) => {
      const lastMessage = chat.lastMessage as any;
      return (
        lastMessage &&
        lastMessage.status === 'sent' &&
        lastMessage.senderId.toString() !== userId.toString()
      );
    });

    return unreadChats;
  }
}
