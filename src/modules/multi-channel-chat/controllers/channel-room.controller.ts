
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put, Query, Res } from '@nestjs/common';
import { ChannelRoomService } from '../services/channel-room.service';
import { ChannelRoomSummaryDto } from '@common/interfaces/multi-channel-chat/channel-room/channel-room-summary.dto';
import { ChannelChatDetail, Channels } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { CreateChannelAgentMessageDto } from '../dto/channel-message/create-message-from-agent.dto';
import { ToogleBotServicesDto } from '../dto/channel-room/toggle-bot-services.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User, UserAttributes } from '@modules/user/entities/user.entity';
import { AdvisorsResponseDto } from '../dto/channel-advisors/get-advisors.dto';
import { Response } from 'express';
import { GetChannelSummaryDto } from '../dto/channel-summary/get-channel-summary.dto';
import { UpdateCitizenBasicInformationDto } from '../dto/channel-room/update-citizen-basic-info.dto';
import { ok } from 'assert';
import { ApiOkResponse } from '@nestjs/swagger';
import { BaseResponseDto } from '@common/dto/base-response.dto';
import { changeChannelRoomStatusDto } from '../dto/channel-room/change-channel-room-status.dto';

@Controller('channel-room')
export class ChannelRoomController {

	constructor(private channelRoomService: ChannelRoomService) {}


	@Get('summary')
	async getRoomSummaries(@CurrentUser() user: User,  @Query() query: GetChannelSummaryDto): Promise<ChannelRoomSummaryDto[]> {
		return this.channelRoomService.getRoomSummaries(query, user);
	}

	@Get('retrieve-rooms')
	async getChannelRoomsForSubscribe(@CurrentUser() user: User): Promise<BaseResponseDto<number[]>> {
		return this.channelRoomService.getChannelRoomsForSubscribe(user);
	}
	
	@Get(':id/advisors')
	getAvailableAdvisors(@CurrentUser() currentUser: User, @Param('id') channelroomId: number): Promise<AdvisorsResponseDto[]> {
		return this.channelRoomService.getAvailableAdvisors(channelroomId, currentUser);
	}
	
	@Get(':channelRoomId/assistance/:assistanceId/detail')
	async getChannelChatDetail(
		@Param('channelRoomId') channelChatId: number,
		@Param('assistanceId') assistanceId: number,
		@Query('limit') limit: string,
		@Query('before') before: string,
	): Promise<ChannelChatDetail> {
		return this.channelRoomService.getChatDetail(channelChatId, assistanceId, { limit, before });
	}


	@Post(':id/reassign-advisor/:advisorId')
	transferToAdvisor(
		@Param('id') channelroomId: number, 
		@Param('advisorId') advisorId: number,
		@Res() res: Response
	)
	{
		return this.channelRoomService.transferToAdvisor(channelroomId, advisorId, res);
	}

	@Post('toggle-bot-services')
	async toggleBotService(@Body() payload: ToogleBotServicesDto): Promise<{ message: string }> {
		try {
			await this.channelRoomService.toggleBotService(payload);
			return {
				message: 'Bot service toggled successfully',
			};
		} catch (error) {
			throw new HttpException
			(
				{
					message: error.message || 'Error al cambiar el estado del bot',
				},
				error.status || HttpStatus.BAD_REQUEST,
			);
		}
	}

	@Put('change-status')
	changeChannelRoomStatus(
		@Body() payload: changeChannelRoomStatusDto 
	): Promise<BaseResponseDto>
	{
		return this.channelRoomService.changeChannelRoomStatus(payload);
	}

}
