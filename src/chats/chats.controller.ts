import { Controller, Get, Param } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get(':userId/:otherUserId')
  async getOrCreateChat(
    @Param('userId') userId: string,
    @Param('otherUserId') otherUserId: string
  ) {
    return this.chatsService.getOrCreateChat(userId, otherUserId);
  }
}