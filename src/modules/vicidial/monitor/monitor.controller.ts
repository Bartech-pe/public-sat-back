import { Controller, Get, Param } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { MonitorVicidialService } from './monitor-vicidial.service';

@Controller('monitor')
export class MonitorController {
  constructor(
    private readonly monitorService: MonitorService,
    private readonly monitorVicidialService: MonitorVicidialService,
  ) {}

  @Get('countChat')
  async countChat() {
    return await this.monitorService.chatCount();
  }

  @Get('countWSP')
  async countWSP() {
    return await this.monitorService.wspCount();
  }

  @Get('countMail')
  async countMail() {
    return await this.monitorService.mailCount();
  }

  @Get('monitorAdvisorsMail')
  async monitorAdvisorsMail() {
    return await this.monitorService.getMailAdvisors();
  }

  @Get('monitorAdvisorsChat')
  async monitorAdvisorsChat() {
    return await this.monitorService.getChatAdvisors();
  }

  @Get('monitorAdvisorsChatWsp')
  async monitorAdvisorsChatWsp() {
    return await this.monitorService.chatWspAdvisors();
  }

  @Get('monitorVicidialCount')
  async monitorVicidialCount() {
    return await this.monitorVicidialService.vicidialReport();
  }

  @Get('monitorVicidialReport')
  async monitorVicidialReport() {
    return await this.monitorVicidialService.vicidialTable();
  }

  @Get('stateDetailsByAdvisor/:agent/:start/:finish')
  async getStateDetailsByAdvisor(
    @Param('agent') agent: number,
    @Param('start') start: Date,
    @Param('finish') finish: Date,
  ) {
    return await this.monitorVicidialService.getStateDetailsByAdvisor(
      agent,
      start,
      finish,
    );
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
