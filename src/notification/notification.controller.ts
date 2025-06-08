import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/users/Decorators/get-user.decorator';
import { NotificationService } from './notification.service';
import { Types } from 'mongoose';
import { NotificationDocument } from './schema/notification.schema';
import { User } from 'src/users/schemas/user.schema';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getUserNotifications(
    @GetUser() user: User,
  ): Promise<NotificationDocument[]> {
    return await this.notificationService.getUserNotifications(
      new Types.ObjectId(user._id),
    );
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @GetUser() user: User,
    @Param('id') id: string,
  ): Promise<NotificationDocument> {
    return await this.notificationService.markAsRead(
      new Types.ObjectId(id),
      new Types.ObjectId(user._id),
    );
  }
}
