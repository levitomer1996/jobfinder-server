import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schema/notification.schema';

@Injectable()
export class NotificationService {
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

  async getUserNotifications(userId: Types.ObjectId) {
    return await this.notificationModel
      .find({ userId })
      .sort({ timeCreated: -1 })
      .exec();
  }

  async markAsRead(id: Types.ObjectId) {
    return await this.notificationModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true },
    );
  }
}
