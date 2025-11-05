import { Body, Controller, Delete, Get, Param, Post, Put, Query, StreamableFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { MailCenterService } from "./services/mail-center.service";
import { CenterEmail, GmailFileExport } from "./dto/center-email.dto";
import { Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { ReplyCenterMail } from "./dto/reply-center-mail.dto";
import { MailFilter } from "./dto/mail-filter.dto";
import { ForwardCenterMail } from "./dto/forward-center-mail.dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Response } from 'express';
import { Res } from '@nestjs/common';
@Controller('mail-center')
export class MailCenterController {
    constructor(private readonly mailCenterService:MailCenterService,
        @InjectQueue('mail-events') private readonly mailQueue: Queue,  
    ){}
    @Get('messagesAdvisor')
    async MessagesByAdvisor(@Query() query: MailFilter) {
        return await this.mailCenterService.GetTicketsByAdvisorEmailId(query);
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
        return await this.mailCenterService.GetEmailAttentionDetail(mailAttentionId)
    }
    @Post('sendcenteremail')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'attachments', maxCount: 10 },
    ]))
    async SendCenterEmail(@Body() body: CenterEmail, 
    @UploadedFiles() files: { attachments?: Express.Multer.File[] }) {
         return await this.mailCenterService.SendEmail(body,files)
    }
    @Post('replyEmailCenter')
    async ReplyEmailCenter(@Body() body:ReplyCenterMail){
       return await this.mailCenterService.RespondMail(body)
    }
    @Post('forwardtoCenter')
    async forwardtoCenter(@Body() body:ForwardCenterMail){
       return await this.mailCenterService.ForwardTo(body)
    }
    @Put('closeTicket/:mailAttentionId')
    async closeTicket(@Param('mailAttentionId') mailAttentionId: number){
      return await this.mailCenterService.CloseTicket(mailAttentionId)
    }
    @Put('attentionTicket/:mailAttentionId')
    async attentionTicket(@Param('mailAttentionId') mailAttentionId: number){
      return await this.mailCenterService.AttenttionTicket(mailAttentionId)
    }
     @Put('noWishTicket/:mailAttentionId')
    async noWishTicket(@Param('mailAttentionId') mailAttentionId: number){
      return await this.mailCenterService.NoWisTicket(mailAttentionId)
    }
    @Put('rebalance')
    async rebalance(){
        return await this.mailCenterService.balanceAdvisors()
    }
    @Post('downloadFile')
    async downloadAttachment(@Body() body: GmailFileExport,
        @Res() res: Response,
    ) {
        const buffer = await this.mailCenterService.getEmailFile(body.messageId, body.attachmentId,body.mimeType,body.filename);
        res.setHeader('Content-Type', body.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${body.filename}"`,
    );
        res.send(buffer);
    }

}


