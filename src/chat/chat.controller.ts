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

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createChat(@GetUser() user: any, @Body() body): Promise<Chat> {
    return await this.chatService.create(user._id, body._id, body.message);
  }
}
