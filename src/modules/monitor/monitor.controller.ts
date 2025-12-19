import { Controller, Get, Param } from '@nestjs/common';
import { MonitorService } from './monitor.service';
import { MonitorVicidialService } from './monitor-vicidial.service';
import { ChannelEnum } from '@common/enums/channel.enum';
import { CategoryChannelEnum } from '@common/enums/category-channel.enum';
import { InboxService } from '@modules/inbox/inbox.service';

@Controller('monitor')
export class MonitorController {
  constructor(
    private readonly monitorService: MonitorService,
    private readonly monitorVicidialService: MonitorVicidialService,
    private readonly inboxService: InboxService,
    // private readonly monitorMultiChannelService: ,
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
    if (categoryId === CategoryChannelEnum.PHONE) {
      return await this.monitorVicidialService.getStateDetailsByAdvisor(userId);
    } else {
      return await this.inboxService.getChannelStateHistoryByUserIdAndCategoryId(
        userId,
        categoryId,
      );
    }
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
