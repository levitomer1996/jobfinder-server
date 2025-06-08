import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schema/notification.schema';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(userId: Types.ObjectId, content: string) {
    const newNotification = new this.notificationModel({
      userId,
      content,
    });
    return await newNotification.save();
  }

  async getUserNotifications(
    userId: Types.ObjectId,
  ): Promise<NotificationDocument[]> {
    return await this.notificationModel.find({
      userId: new Types.ObjectId(userId),
    });
  }

  async markAsRead(
    notificationId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<NotificationDocument> {
    try {
      this.logger.log(`Fetching notification with ID ${notificationId}`);
      const foundNotification =
        await this.notificationModel.findById(notificationId);

      if (!foundNotification) {
        this.logger.warn(`Notification ${notificationId} not found`);
        throw new BadRequestException('Notification not found');
      }

      if (!foundNotification.userId.equals(userId)) {
        this.logger.warn(
          `User ${userId} is not authorized to mark notification ${notificationId} as read`,
        );
        throw new BadRequestException('Unauthorized to mark this notification');
      }

      this.logger.log(`Marking notification ${notificationId} as read`);
      const updatedNotification =
        await this.notificationModel.findByIdAndUpdate(
          notificationId,
          { isRead: true },
          { new: true },
        );

      this.logger.log(`Notification ${notificationId} marked as read`);
      return updatedNotification;
    } catch (error) {
      this.logger.error(
        `Failed to mark notification ${notificationId} as read`,
        error.stack,
      );
      throw error;
    }
  }
}
