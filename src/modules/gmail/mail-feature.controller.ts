import { MailAttachmentRepository } from './repositories/mail-attachment.repository';
import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { MailFeaturesService } from "./services/mail-features.service";
import { MailFilter } from "./dto/mail-filter.dto";
import { MailAttachmentService } from './services/mail-attachment.service';
import { GenericEmail } from './dto/center-email.dto';

@Controller('mail-feature')
export class MailFeatureController {
    constructor(private readonly mailfeatureService:MailFeaturesService,
        private readonly mailAttachmentService:MailAttachmentService
    ){
    }
     @Put('filesMessage/:mailthreadId')
    async getFilesByMessageId(@Param('mailthreadId') mailthreadId: string){
        return await this.mailAttachmentService.getFilesByMessageId(mailthreadId)
    }
    @Put('trashMail/:mailthreadId')
    async trashMail(@Param('mailthreadId') mailthreadId: number){
        return await this.mailfeatureService.trashMail(mailthreadId)
    }
    @Put('draftMail/:mailthreadId')
    async draftMail(@Param('mailthreadId') mailthreadId: number){
        return await this.mailfeatureService.draftMail(mailthreadId)
    }
    @Put('sendMail/:mailthreadId')
    async sendMail(@Param('mailthreadId') mailthreadId: number){
        return await this.mailfeatureService.changeSendMail(mailthreadId)
    }
    @Put('spamMail/:mailthreadId')
    async spamMail(@Param('mailthreadId') mailthreadId: number){
        return await this.mailfeatureService.SpamMail(mailthreadId)
    }
    @Put('favoriteMail/:mailthreadId')
    async favoriteMail(@Param('mailthreadId') mailthreadId: number) {
        return await this.mailfeatureService.favoriteUpdate(mailthreadId)
    }
    @Get('mailTrashList')
    async mailTrashList(@Query() query: MailFilter) {
        return await this.mailfeatureService.mailTrashList(query);
    }
    @Get('mailDraftList')
    async mailDraftList(@Query() query: MailFilter) {
        return await this.mailfeatureService.mailDraftList(query);
    }
    @Get('mailSpamList')
    async mailSpamList(@Query() query: MailFilter) {
        return await this.mailfeatureService.mailSpamList(query);
    }
    @Get('mailFavoriteList')
    async mailFavoriteList(@Query() query: MailFilter) {
        return await this.mailfeatureService.favoriteList(query);
    }
    @Post('genericEmail')
    async genericEmail(@Body() body:GenericEmail){
        return await this.mailfeatureService.buildGenericEmail(body)
    }
}
