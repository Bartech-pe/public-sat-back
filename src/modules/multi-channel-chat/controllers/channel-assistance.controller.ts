import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { AssistanceService } from "../services/assistance.service";
import { BaseResponseDto } from "@common/dto/base-response.dto";
import { CloseAssistanceDto } from "../dto/assistances/close-assistance.dto";
import { ChannelAssistanceDto, MessagesResponseDto } from "../dto/assistances/get-assistance.dto";

@Controller('channel-room')
export class ChannelAssistanceController {

	constructor(private assistanceService: AssistanceService) {}


	@Put('assistance/close')
	async closeAssistanceService(@Body() payload : CloseAssistanceDto) {
		return this.assistanceService.closeAssistance(payload);
	}

	@Get('assistance/:assistanceId')
	async getMessagesFromAssistance(
		@Param('assistanceId') assistanceId: number
	): Promise<BaseResponseDto<MessagesResponseDto>> {
		return this.assistanceService.getMessagesFromAssistance(assistanceId);
	}

	@Get(':channelRoomId/assistance/retrieve')
	async getAssistances(
		@Param('channelRoomId') channelRoomId: number
	): Promise<BaseResponseDto<ChannelAssistanceDto[]>> {
		if (!channelRoomId) {
			throw new BadRequestException('El parámetro channelRoomId es obligatorio');
		}
		return this.assistanceService.getAssistances(channelRoomId);
	}

	
	@Post('assistance/:assistanceId/send-to-email')
	async sendMessagesHtmlFromAssistance(
		@Param('assistanceId') assistanceId: number
	): Promise<any> {
		return this.assistanceService.sendMessagesHtmlFromAssistance(assistanceId);
	}
}
