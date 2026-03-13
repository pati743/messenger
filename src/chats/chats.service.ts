import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  // Создать или получить чат между двумя пользователями
  async getOrCreateChat(user1Id: string, user2Id: string) {
    // Ищем существующий чат
    const existing = await this.prisma.chat.findFirst({
      where: {
        AND: [
          { users: { some: { userId: user1Id } } },
          { users: { some: { userId: user2Id } } }
        ]
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                online: true
              }
            }
          }
        },
        messages: {
          where: { deleted: false },
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (existing) {
      return existing;
    }

    // Создаем новый чат
    return this.prisma.chat.create({
      data: {
        users: {
          create: [
            { userId: user1Id },
            { userId: user2Id }
          ]
        }
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                online: true
              }
            }
          }
        },
        messages: true
      }
    });
  }

  // Получить все чаты пользователя
  async getUserChats(userId: string) {
    const userChats = await this.prisma.userChat.findMany({
      where: { userId },
      include: {
        chat: {
          include: {
            users: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                    online: true
                  }
                }
              }
            },
            messages: {
              where: { deleted: false },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    });

    return userChats.map(uc => uc.chat);
  }

  // Отправить сообщение
  async sendMessage(chatId: string, userId: string, text: string, imageUrl?: string) {
    return this.prisma.message.create({
      data: {
        text,
        imageUrl,
        chatId,
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });
  }

  // Удалить сообщение (soft delete)
  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message || message.userId !== userId) {
      throw new Error('Нельзя удалить это сообщение');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { deleted: true }
    });
  }
}