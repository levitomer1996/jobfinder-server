import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MessageToEdit } from './dto/MessageToEdit.dto';
import { MessagesService } from './messages.service';
import { Types } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { GetUser } from 'src/users/Decorators/get-user.decorator';

@Controller('messages')
export class MessagesController {
  constructor(private messageSerivce: MessagesService) {}
  @UseGuards(JwtAuthGuard)
  @Patch('/setmessageread')
  async markAsRead(@Body() messages: MessageToEdit[], @GetUser() user: User) {
    const matchingMessageIds = messages
      .filter((msg) => msg.receiverId === user._id)
      .map((msg) => msg._id);
    return this.messageSerivce.markMessageAsRead(matchingMessageIds);
  }
}
