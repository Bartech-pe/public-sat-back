import { ApiProperty } from "@nestjs/swagger";
import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, isString } from "class-validator";
import { AssistanceStatus } from "@modules/multi-channel-chat/entities/assistance.entity";

export class CloseAssistanceDto {
	@ApiProperty({ description: "ID de la sala del canal (ChannelRoom)" })
	@IsNumber({}, { message: v.isNumber("channelRoomId") })
	@IsOptional()
	channelRoomId?: number;

	@ApiProperty({ description: "ID de la asistencia (Assitances)" })
	@IsNumber({}, { message: v.isNumber("assistanceId") })
	@IsOptional()
	assistanceId?: number;

	@ApiProperty({ description: "ID de la asistencia (Assitances)" })
	@IsOptional()
	phoneNumber?: string;

}