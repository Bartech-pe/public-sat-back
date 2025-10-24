import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { ChannelRoomService } from '../services/channel-room.service';
import { ChannelRoomSummaryDto } from '@common/interfaces/multi-channel-chat/channel-room/channel-room-summary.dto';
import { ChannelChatDetail } from '@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto';
import { ToogleBotServicesDto } from '../dto/channel-room/toggle-bot-services.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { AdvisorsResponseDto } from '../dto/channel-advisors/get-advisors.dto';
import { Response } from 'express';
import { GetChannelSummaryDto } from '../dto/channel-summary/get-channel-summary.dto';
import { BaseResponseDto } from '@common/dto/base-response.dto';
import { changeChannelRoomStatusDto } from '../dto/channel-room/change-channel-room-status.dto';
import { Public } from '@common/decorators/public.decorator';
import { CreateChannelQueryHistoryDto } from '../dto/channel-query-history/create-channel-query-history.dto';

@Controller('channel-room')
export class ChannelRoomController {
  constructor(private channelRoomService: ChannelRoomService) {}

  @Get('summary')
  async getRoomSummaries(
    @CurrentUser() user: User,
    @Query() query: GetChannelSummaryDto,
  ): Promise<ChannelRoomSummaryDto[]> {
    return this.channelRoomService.getRoomSummaries(query, user);
  }

  @Get('retrieve-rooms')
  async getChannelRoomsForSubscribe(
    @CurrentUser() user: User,
  ): Promise<BaseResponseDto<number[]>> {
    return this.channelRoomService.getChannelRoomsForSubscribe(user);
  }
  
  @Public()
  @Get('check-available-advisors')
  async checkForAvailableAdvisorsForChatsat(): Promise<{availableAdvisors: number}> {
    return this.channelRoomService.checkForAvailableAdvisors();
  }

  @Get(':id/advisors')
  getAvailableAdvisors(
    @CurrentUser() currentUser: User,
    @Param('id') channelroomId: number,
  ): Promise<AdvisorsResponseDto[]> {
    return this.channelRoomService.getAvailableAdvisors(
      channelroomId,
      currentUser,
    );
  }

  @Get(':channelRoomId/assistance/:assistanceId/detail')
  async getChannelChatDetail(
    @Param('channelRoomId') channelChatId: number,
    @Param('assistanceId') assistanceId: number,
    @Query() payload: {
      limit?: string;
      before?: string;
    } 
  ): Promise<ChannelChatDetail> {
    return this.channelRoomService.getChatDetail(channelChatId, assistanceId, payload);
  }

  @Post(':id/reassign-advisor/:advisorId')
  transferToAdvisor(
    @Param('id') channelroomId: number,
    @Param('advisorId') advisorId: number,
  ): Promise<BaseResponseDto> {
    return this.channelRoomService.transferToAdvisor(
      channelroomId,
      advisorId,
    );
  }

  @Post('toggle-bot-services')
  async toggleBotService(
    @Body() payload: ToogleBotServicesDto,
  ): Promise<{ message: string }> {
    try {
      await this.channelRoomService.toggleBotService(payload);
      return {
        message: 'Bot service toggled successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Error al cambiar el estado del bot',
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Public()
  @Post('citizen/:phoneNumber/bot-query')
  async saveBotQuery(
    @Param('phoneNumber') phoneNumber: string,
    @Body() payload: CreateChannelQueryHistoryDto
  ): Promise<{ message: string }> {
    try {
      await this.channelRoomService.saveBotQuery(payload, phoneNumber);
      return {
        message: 'Bot service toggled successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Error al cambiar el estado del bot',
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('change-status')
  changeChannelRoomStatus(
    @Body() payload: changeChannelRoomStatusDto,
  ): Promise<BaseResponseDto> {
    return this.channelRoomService.changeChannelRoomStatus(payload);
  }
}
