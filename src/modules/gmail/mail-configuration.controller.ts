import { Body, Controller, Get, Param, Post, Put, Query, Redirect, Res } from "@nestjs/common";
import { MailCredentialService } from "./services/mail-credential.service";
import { GmailChannelService } from "./services/gmail-channel.service";
import { Public } from "@common/decorators/public.decorator";
import { CreateMailCredential } from "./dto/create-mail-credential.dto";

@Controller('mail-configuration')
export class MailConfigurationController {
    constructor(private readonly mailCredentialService:MailCredentialService,
        private readonly gmailChannelService:GmailChannelService
    ){

    }
    @Public()
    @Get('createCredential')
    @Redirect()
    async createCredentialByEmail(@Query() body: { code: string }, @Res() res: Response,) {
        await this.mailCredentialService.refreshNewToken(body.code)
        return {
            url: 'http://localhost:4200/settings/inboxes',
            statusCode: 302 
        };
    }
    @Post('loginCredential')
    async GenerateUrl(@Body() body:{username:string}){
       return await this.gmailChannelService.login(body.username);
    }
    @Post('generateGmailCredential')
    async generateGmailCredential(@Body() body:CreateMailCredential){
       return await this.mailCredentialService.createCredential(body);
    }
    @Put('setWatch')
    async setWatch(){
        return await this.mailCredentialService.setWatch();
    }
     @Put('setOAuth')
    async setOAuth(){
        return await this.mailCredentialService.setOAuth();
    }
}
