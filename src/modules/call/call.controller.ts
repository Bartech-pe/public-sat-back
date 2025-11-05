import { RecordingDTO } from './dto/RecordingDTO';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { CallDTO, InterferCallDTO } from './dto/CallDTO';
import { EndDTO } from './dto/EndDTO';
import { SMSIndividualDto, SMSMAsivoDto } from './dto/SMS';
import { CreateConversationDto } from '@common/proxy/rasa/dto/Conversation';
import { RasaService } from './rasa.service';
import {
  SendMessageHookDto,
  SendMessageRasaDto,
} from '@common/proxy/rasa/dto/Rasa';
import { AmiService } from './services/ami.service';
import { CallService } from './services/call.service';
import { SMSService } from './services/sms.service';
import { SatService } from './services/sat.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { CallFilter } from './dto/call/callFilter';
import { CreateCallDto } from './dto/call/CallCollection';
import { SpyDTO } from './dto/SpyDTO';
import { AMIFilter } from './dto/ami/AMI';

@Controller('call')
export class CallController {
  constructor(
    private readonly amiService: AmiService,
    private readonly callService: CallService,
    private readonly satService: SatService,
    private readonly smsService: SMSService,
    private readonly saraService: RasaService
  ) {}
  @Post('start-call')
  async statCall(@Body() body: CallDTO) {
    const res = await this.amiService.callStart(body);
    return { success: true, respuesta: res };
  }
  @Post('park-call')
  async parkCall(@Body() body: CallDTO) {
    const res = await this.amiService.ParckCall(body);
    return { success: true, respuesta: res };
  }
  @Post('end-call')
  async endCall(@Body() body: EndDTO) {
    const res = await this.amiService.callEnd(body.channel);
    return { success: true, respuesta: res };
  }
  @Get('active-channels')
  activeChannels(
   @Query() query: AMIFilter
  ) {
    const canales = this.amiService.GetCoreChannel(query);
    return canales;
  }
  @Get('active-channels-action')
  activeChannelsAction(){
    this.amiService.RunGetCoreChannelAction()
    return {success:true}
  }
  
  @Post('listen')
  async listen(@Body() body: SpyDTO) {
    const res = await this.amiService.spyCall(body);
    return { success: true, resultado: res };
  }
  @Post('enter-call')
  async enterCall(@Body() body: SpyDTO) {
    const res = await this.amiService.enterCall(body);
    return { success: true, resultado: res };
  }
  @Post('interfer-call')
  async InterferCall(@Body() body: InterferCallDTO) {
    const res = await this.amiService.InterferCall(body);
    return { success: true, resultado: res };
  }
  @Post('recording')
  async grabar(@Body() body: RecordingDTO) {
    const res = await this.amiService.recording(body);
    return { success: true, resultado: res };
  }
  @Post('stop-recording')
  async stopRecording(@Body() body: EndDTO) {
    const res = await this.amiService.stopRecording(body.channel);
    return { success: true, respuesta: res };
  }
  @Get('recording/:filename')
  async downloadRecording(@Param('filename') filename: string, @Res() res: Response) {
     /*const buffer = await this.amiService.downloadRecordingFromAsterisk(filename);
     res.set({
      'Content-Type': 'audio/wav',
      'Content-Disposition': 'attachment; filename="resultado.wav"',
    });
    res.send(buffer);*/
  }
  @Get('download/:filename')
  async downloadFilename(@Param('filename') filename: string, @Res() res: Response) {
      const localPath = `./downloads/${filename}`;
      res.download(localPath, filename, (err) => {
        if (err) {
          console.error('Error al descargar el archivo:', err);
          res.status(500).send('Error al descargar el archivo');
        }
      });

  }

  @Get('papeleta-info/:code/:type')
  async PapeletaInfo(@Param('code') code: string, @Param('type') type: string) {
    const response = await this.satService.GetPapeletaInfo(code, type);
    return response;
  }
  @Get('tributo-info/:code/:type')
  async tributoInfo(@Param('code') code: string, @Param('type') type: string) {
    const response = await this.satService.GetTributoInfo(code, type);
    return response;
  }
  @Post('sms-solo')
  async SMSSolo(@Body() body: SMSIndividualDto) {
    const res = await this.smsService.Solo(body);
    return { success: true, resultado: res };
  }
  @Post('sms-masive')
  async SMSMasive(@Body() body: SMSMAsivoDto) {
    const res = await this.smsService.Massive(body);
    return { success: true, resultado: res };
  }
  @Get('conversations/:senderId/stats')
  async getConversationStats(@Param('senderId') senderId: string) {
    const stats = await this.saraService.getConversation(senderId);
    return {
      success: true,
      data: stats,
    };
  }
  @Post('conversations/new')
  async createNewConversation(@Body() body: CreateConversationDto) {
    const response = await this.saraService.createConversation(body);
    return response;
  }
  @Put('conversations/:senderId/pause')
  async pauseConversation(@Param('senderId') senderId: string) {
    const response = await this.saraService.pauseConversation(senderId);
    return response;
  }
  @Put('conversations/:senderId/resume')
  async resumeConversation(@Param('senderId') senderId: string) {
    const response = await this.saraService.resumeConversation(senderId);
    return response;
  }
  @Post('conversations/:senderId/continue')
  async continueConversation(@Body() body: SendMessageRasaDto) {
    const response = await this.saraService.continueConversation(body);
    return response;
  }
  @Get('conversations/:senderId/history')
  async getConversationHistory(@Param('senderId') senderId: string) {
    const response = await this.saraService.getConversationHistory(senderId);
    return response;
  }
  @Post('webhook/telegram')
  async telegramWebhook(@Body() body: SendMessageHookDto) {
    const response = await this.saraService.telegramWebHook(body);
    return response;
  }
  @Post('webhook/whatsapp')
  async whatsappWebhook(@Body() body: SendMessageHookDto) {
    const response = await this.saraService.whastappWebHook(body);
    return response;
  }
  //@ApiBearerAuth()
  //@UseGuards(JwtAuthGuard)
  @Get()
  async getCalls(@Query() query: CallFilter) {
    const response = await this.callService.getCallsFromVicidial(query);
    return response;
  }

  @Get('statesCount')
  async getCallsCounters(@Query() query: CallFilter) {
    const response = await this.callService.getCallsCountersFromVicidial(query);
    return response;
  }
  //@ApiBearerAuth()
  //@UseGuards(JwtAuthGuard)
  // @Get('statesCount')
  // async getStateCount() {
  //   return await this.callService.findByCategories();
  // }
  //@ApiBearerAuth()
  //@UseGuards(JwtAuthGuard)
  @Post()
  async createCall(@Body() body: CreateCallDto) {
    const response = await this.callService.create(
      body.duration,
      body.phoneNumber,
      body.stateId,
      body.advisorId,
      body.recording,
    );
    return response;
  }
  @Get('advisors')
  async getAdvisors() {
    return await this.callService.getAdvisors();
  }
}
