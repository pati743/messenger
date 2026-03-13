import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { PrismaService } from '../../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatsService: ChatsService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    
    if (userId) {
      // Сохраняем connection
      await this.prisma.user.update({
        where: { id: userId },
        data: { online: true }
      });
      
      // Подписываем на комнаты с чатами
      const userChats = await this.prisma.userChat.findMany({
        where: { userId },
        select: { chatId: true }
      });
      
      userChats.forEach(chat => {
        client.join(`chat_${chat.chatId}`);
      });
      
      client.join(`user_${userId}`);
      
      // Уведомляем других
      client.broadcast.emit('user_online', { userId });
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    
    if (userId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { online: false }
      });
      
      client.broadcast.emit('user_offline', { userId });
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { chatId: string; text: string; imageUrl?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.query.userId as string;
    
    const message = await this.chatsService.sendMessage(
      data.chatId,
      userId,
      data.text,
      data.imageUrl
    );
    
    // Отправляем всем в чате
    this.server.to(`chat_${data.chatId}`).emit('new_message', message);
    
    return { success: true };
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { chatId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.query.userId as string;
    
    client.to(`chat_${data.chatId}`).emit('user_typing', {
      userId,
      isTyping: data.isTyping
    });
  }
}