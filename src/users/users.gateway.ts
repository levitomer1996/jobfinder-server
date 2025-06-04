import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Types } from 'mongoose';

import { ApplicationService } from 'src/applications/applications.service';
import { JobsService } from 'src/jobs/jobs.service';
import { NotificationService } from 'src/notification/notification.service';
import { CreateApplicationDto } from 'src/applications/dto/create-application.dto';
import { ChatService } from 'src/chat/chat.service';

@WebSocketGateway({
  namespace: '/user',
  cors: { origin: '*' },
})
export class UserGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('UserGateway');

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly jobService: JobsService,
    private readonly notificationService: NotificationService,
    private readonly chatService: ChatService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // ======================
  // Chat-related Functions
  // ======================

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(chatId);
    this.logger.log(`Client ${client.id} joined room ${chatId}`);
    client.emit('joined', chatId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: {
      senderId: string;
      receiverId: string;
      content: string;
    },
  ) {
    const senderObjectId = new Types.ObjectId(data.senderId);
    const receiverObjectId = new Types.ObjectId(data.receiverId);

    // 🔄 Get or create chat
    const chat = await this.chatService.getOrCreateChat(
      senderObjectId,
      receiverObjectId,
    );

    // 📨 Send message to chat
    const message = await this.chatService.sendMessage(
      senderObjectId,
      receiverObjectId,
      chat._id,
      data.content,
    );

    this.server.to(chat._id.toString()).emit('newMessage', message);
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { chatId: string; from: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, from } = data;
    client.to(chatId).emit('typing', { chatId, from });
    this.logger.log(`User ${from} is typing in chat ${chatId}`);
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    @MessageBody() data: { chatId: string; messageIds: Types.ObjectId[] },
  ) {
    const { chatId, messageIds } = data;

    this.logger.log(`Marking messages as read in chat ${chatId}`);

    const updatedIds = await this.chatService.markMessagesAsRead(messageIds);
    this.server.to(chatId).emit('messagesMarkedRead', updatedIds);
  }

  // =============================
  // Application-related Functions
  // =============================

  @SubscribeMessage('createUserApplication')
  async handleCreateUserApplication(
    @MessageBody() createApplicationDto: CreateApplicationDto,
  ) {
    this.logger.log(`Payload: ${JSON.stringify(createApplicationDto)}`);

    const application =
      await this.applicationService.create(createApplicationDto);

    this.logger.log('Creating notification');
    const foundJob = await this.jobService.getJobById(application.jobId);

    await this.notificationService.createNotification(
      new Types.ObjectId(foundJob.postedBy),
      `New job application submitted by user`,
    );

    this.server.emit(`newApplication:${foundJob.postedBy}`, application);
    return application;
  }
}
