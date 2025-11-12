import { Controller, Get, Param } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { MonitorVicidialService } from './monitor-vicidial.service';
import { ChannelEnum } from '@common/enums/channel.enum';

@Controller('monitor')
export class MonitorController {
  constructor(
    private readonly monitorService: MonitorService,
    private readonly monitorVicidialService: MonitorVicidialService,
  ) {}

  @Get('countChat')
  async countChat() {
    return await this.monitorService.channelCount(ChannelEnum.CHATSAT);
  }

  @Get('countWSP')
  async countWSP() {
    return await this.monitorService.channelCount(ChannelEnum.WHATSAPP);
  }

  @Get('countMail')
  async countMail() {
    return await this.monitorService.mailCount();
  }

  @Get('monitorAdvisorsMail')
  async monitorAdvisorsMail() {
    return await this.monitorService.getMonitoringEmailUsers();
  }

  @Get('monitorAdvisorsChat')
  async monitorAdvisorsChat() {
    return await this.monitorService.getMonitoringMultiChannel(
      ChannelEnum.CHATSAT,
    );
  }

  @Get('monitorAdvisorsChatWsp')
  async monitorAdvisorsChatWsp() {
    return await this.monitorService.getMonitoringMultiChannel(
      ChannelEnum.WHATSAPP,
    );
  }

  @Get('monitorVicidialCount')
  async monitorVicidialCount() {
    return await this.monitorVicidialService.vicidialReport();
  }

  @Get('monitorVicidialReport')
  async monitorVicidialReport() {
    return await this.monitorVicidialService.vicidialTable();
  }

  @Get('stateDetailsByAdvisor/:userId/:categoryId')
  async getStateDetailsByAdvisor(
    @Param('userId') userId: number,
    @Param('categoryId') categoryId: number,
  ) {
    return await this.monitorVicidialService.getStateDetailsByAdvisor(userId);
  }

  @Get('monitorVicidialCountDashBoard')
  async monitorVicidialCountDashBoard() {
    return await this.monitorVicidialService.getCallsCount();
  }

  @Get('attentionDetail/:userId')
  async attentionDetail(@Param('userId') userId: number) {
    return await this.monitorService.attentionDetail(userId);
  }

  @Get('attentionDate/:date')
  async attentionDate(@Param('date') date: Date) {
    return await this.monitorService.attentionDate(date);
  }
}
