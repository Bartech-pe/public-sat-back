import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ChannelAttentionService } from '../services/channel-attention.service';
import { CloseChannelAttentionDto } from '../dto/channel-attentions/close-assistance.dto';
import { BaseResponseDto } from '@common/dto/base-response.dto';
import {
  ChannelAttentionDto,
  MessagesResponseDto,
} from '../dto/channel-attentions/get-assistance.dto';
import { Public } from '@common/decorators/public.decorator';
import { JwtSecretRequestType } from '@nestjs/jwt';
import { JwtCitizenGuard } from '@common/guards/jwt-citizen.guard';

@Controller('channel-room/assistances')
export class ChannelAttentionController {
  constructor(private assistanceService: ChannelAttentionService) {}

  @Put('assistance/close')
  async closeChannelAttentionService(
    @Body() payload: CloseChannelAttentionDto,
  ) {
    return this.assistanceService.closeChannelAttention(payload);
  }

  @Get(':assistanceId')
  async getMessagesFromChannelAttention(
    @Param('assistanceId') assistanceId: number,
  ): Promise<BaseResponseDto<MessagesResponseDto>> {
    return this.assistanceService.getMessagesFromChannelAttention(assistanceId);
  }

  @Get(':channelRoomId/assistance/retrieve')
  async getChannelAttentions(
    @Param('channelRoomId') channelRoomId: number,
  ): Promise<BaseResponseDto<ChannelAttentionDto[]>> {
    if (!channelRoomId) {
      throw new BadRequestException(
        'El parámetro channelRoomId es obligatorio',
      );
    }
    return this.assistanceService.getChannelAttentions(channelRoomId);
  }

  @Post(':assistanceId/send-to-email')
  async sendMessagesHtmlFromChannelAttentionForCRM(
    @Param('assistanceId') assistanceId: number,
  ): Promise<any> {
    return this.assistanceService.sendMessagesHtmlFromChannelAttention(
      assistanceId,
    );
  }

  @Public()
  @UseGuards(JwtCitizenGuard)
  @Post(':assistanceId/chatsat/send-to-email')
  async sendMessagesHtmlFromChannelAttentionForChatsat(
    @Param('assistanceId') assistanceId: number,
  ): Promise<any> {
    return this.assistanceService.sendMessagesHtmlFromChannelAttention(
      assistanceId,
    );
  }
}
