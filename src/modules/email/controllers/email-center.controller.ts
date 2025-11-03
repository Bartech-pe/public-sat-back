import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { EmailCenterService } from '../services/email-center.service';
import { MailFilter } from '../dto/mail-filter.dto';
import { CenterEmail, GmailFileExport } from '../dto/center-email.dto';
import { ReplyCenterMail } from '../dto/reply-center-mail.dto';
import { Response } from 'express';
import { ForwardCenterMail } from '../dto/forward-center-mail.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';

@ApiBearerAuth()
@Controller('mail-center')
export class EmailCenterController {
  constructor(private readonly mailCenterService: EmailCenterService) {}

  @Get('messagesAdvisor')
  messagesAdvisor(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<any>> {
    console.log('query', query);
    const limit = query.limit!;
    const offset = query.offset!;
    return this.mailCenterService.getTickets(user, limit, offset, query.q);
  }

  @Get('messagesAdvisorOpen')
  async messagesAdvisorOpen(@Query() query: MailFilter) {
    return await this.mailCenterService.getTicketsOpen(query);
  }

  @Get('messagesAdvisorClose')
  async messagesAdvisorClose(@Query() query: MailFilter) {
    return await this.mailCenterService.getTicketsClose(query);
  }

  @Get('messagesAdvisorPending')
  async messagesAdvisorPending(@Query() query: MailFilter) {
    return await this.mailCenterService.getTicketsPending(query);
  }

  @Get('messagesAdvisorNoWish')
  async messagesAdvisorNoWish(@Query() query: MailFilter) {
    return await this.mailCenterService.getTicketsNoWish(query);
  }

  @Get('messagesNoAdvisor')
  async messagesNoAdvisor(@Query() query: MailFilter) {
    return await this.mailCenterService.getTicketsNoAdvisor(query);
  }

  @Get('messageDetail/:mailAttentionId')
  async MessageDetail(@Param('mailAttentionId') mailAttentionId: number) {
    return await this.mailCenterService.GetEmailAttentionDetail(
      mailAttentionId,
    );
  }

  @Post('sendEmailCenter')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 10 }]),
  )
  async SendEmailCenter(
    @CurrentUser() user: User,
    @Body() body: CenterEmail,
    @UploadedFiles() files: { attachments?: Express.Multer.File[] },
  ) {
    return await this.mailCenterService.SendEmail(body, files, user.id);
  }

  @Post('replyEmailCenter')
  async ReplyEmailCenter(@Body() body: ReplyCenterMail) {
    return await this.mailCenterService.RespondMail(body);
  }

  @Post('forwardtoCenter')
  async forwardtoCenter(@Body() body: ForwardCenterMail) {
    return await this.mailCenterService.ForwardTo(body);
  }

  @Put('closeTicket/:mailAttentionId')
  async closeTicket(@Param('mailAttentionId') mailAttentionId: number) {
    return await this.mailCenterService.CloseTicket(mailAttentionId);
  }

  @Put('closeTicketMultiple')
  async closeTicketMultiple(
    @Body('mailAttentionIds') mailAttentionIds: number[],
  ) {
    return await this.mailCenterService.closeTicketMultiple(mailAttentionIds);
  }

  @Put('attentionTicket')
  async attentionTicket(@Body('mailAttentionIds') mailAttentionIds: number[]) {
    return await this.mailCenterService.attentionTicket(mailAttentionIds);
  }

  @Put('noWishTicket')
  async noWishTicket(@Body('mailAttentionIds') mailAttentionIds: number[]) {
    return await this.mailCenterService.noWisTicket(mailAttentionIds);
  }

  @Put('rebalance')
  async rebalance() {
    return await this.mailCenterService.balanceAdvisors();
  }

  @Post('downloadFile')
  async downloadAttachment(
    @Body() body: GmailFileExport,
    @Res() res: Response,
  ) {
    const buffer = await this.mailCenterService.getEmailFile(
      body.messageId,
      body.attachmentId,
      body.mimeType,
      body.filename,
    );
    res.setHeader('Content-Type', body.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${body.filename}"`,
    );
    res.send(buffer);
  }

  @Put('changeEmailMyState/:channelStateId')
  async changeEmailMyState(
    @CurrentUser() user: User,
    @Param('channelStateId') channelStateId: number,
  ) {
    return await this.mailCenterService.changeEmailState(
      user.id,
      channelStateId,
    );
  }
  @Put('changeEmailState/:userId/:channelStateId')
  async changeEmaiState(
    @Param('channelStateId') channelStateId: number,
    @Param('userId') userId: number,
  ) {
    return await this.mailCenterService.changeEmailState(
      userId,
      channelStateId,
    );
  }
}
