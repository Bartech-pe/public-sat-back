import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Redirect,
} from '@nestjs/common';
import { EmailCredentialService } from '../services/email-credential.service';
import { EmailChannelService } from '../services/email-channel.service';
import { Public } from '@common/decorators/public.decorator';
import { envConfig } from 'config/env';
import { CreateMailCredential } from '../dto/create-mail-credential.dto';

@Controller('mail-configuration')
export class EmailConfigurationController {
  constructor(
    private readonly mailCredentialService: EmailCredentialService,
    private readonly emailChannelService: EmailChannelService,
  ) {}

  @Public()
  @Get('createCredential')
  @Redirect()
  async createCredentialByEmail(@Query() body: { code: string }) {
    if (body.code) {
      await this.mailCredentialService.refreshNewToken(body.code);
    } else {
      this.mailCredentialService.deleteEmailInbox();
    }
    return {
      url: `${envConfig.crmUrl}/settings/channels`,
      statusCode: 302,
    };
  }

  @Post('loginCredential')
  async GenerateUrl(@Body() body: { email: string }) {
    return await this.emailChannelService.login(body.email);
  }

  @Post('generateGmailCredential')
  async generateGmailCredential(@Body() body: CreateMailCredential) {
    return await this.mailCredentialService.createCredential(body);
  }

  @Put('setWatch')
  async setWatch() {
    return await this.mailCredentialService.setWatch();
  }

  @Put('setOAuth')
  async setOAuth() {
    return await this.mailCredentialService.setOAuth();
  }
}
