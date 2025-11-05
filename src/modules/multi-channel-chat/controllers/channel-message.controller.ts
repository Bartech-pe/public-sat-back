
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChannelRoomService } from '../services/channel-room.service';
import { ChannelRoomSummaryDto } from '@common/interfaces/multi-channel-chat/channel-room/channel-room-summary.dto';
import { ChannelChatDetail } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { CreateChannelAgentMessageDto } from '../dto/channel-message/create-message-from-agent.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';


@Controller('channel-message')
export class ChannelMessageController {

	constructor(private channelRoomService: ChannelRoomService) {}

	@Post('send')
	async sendMessage(@Body() payload: CreateChannelAgentMessageDto,  @CurrentUser() user: User) {
		return this.channelRoomService.sendMessage(payload, user);
	}

}
