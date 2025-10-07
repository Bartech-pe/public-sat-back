import { Body, Controller, Post } from '@nestjs/common';
import { ChannelRoomService } from '../services/channel-room.service';
import { CreateChannelAgentMessageDto } from '../dto/channel-message/create-message-from-agent.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';

@Controller('channel-message')
export class ChannelMessageController {
  constructor(private channelRoomService: ChannelRoomService) {}

  @Post('send')
  async sendMessage(
    @Body() payload: CreateChannelAgentMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.channelRoomService.sendMessage(payload, user);
  }
}
