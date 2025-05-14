import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

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
  async handleSendMessage(@MessageBody() data: any) {
    const { senderId, receiverId, chatId, content } = data;

    this.logger.log(`Message received in chat ${chatId}: ${content}`);

    const message = await this.chatService.sendMessage(
      senderId,
      receiverId,
      chatId,
      content,
    );

    this.logger.log(`Emitting message to room ${chatId}`);
    this.server.to(chatId).emit('newMessage', message);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { chatId: string; from: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, from } = data;

    // Broadcast "typing" event to everyone else in the room
    client.to(chatId).emit('typing', { chatId, from });

    this.logger.log(`User ${from} is typing in chat ${chatId}`);
  }
}
