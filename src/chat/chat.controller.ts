import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/users/Decorators/get-user.decorator';
import { Chat } from './schemas/chat.schema';
import GetChatsByUserId from './dto/GetChatsByUserId.dto';
import { User } from 'src/users/schemas/user.schema';
import { Message } from 'src/messages/schemas/message.schema';
import { Types } from 'mongoose';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createChat(@GetUser() user: any, @Body() body): Promise<Chat> {
    return await this.chatService.create(user._id, body._id, body.message);
  }
  @Post('/sendmessage')
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @GetUser() user: any,
    @Body()
    body: {
      receiverId: Types.ObjectId;
      chatId: Types.ObjectId;
      content: string;
    },
  ): Promise<Message> {
    const { receiverId, chatId, content } = body;
    return await this.chatService.sendMessage(
      user._id,
      receiverId,
      chatId,
      content,
    );
  }

  @Get('/getchatbyuserid')
  @UseGuards(JwtAuthGuard)
  async getChatByUserId(@GetUser() user: User): Promise<GetChatsByUserId[]> {
    return await this.chatService.getChatsByUserId(user._id);
  }
}
