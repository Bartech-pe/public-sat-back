import { Body, Controller, Post } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SMSIndividualDto, SMSMAsivoDto } from './dto/sms.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

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
}
