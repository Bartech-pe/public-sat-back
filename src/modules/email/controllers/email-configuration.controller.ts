import {
  BadRequestException,
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
import { RedisService } from '../redis/redis.service';

@Controller('mail-configuration')
export class EmailConfigurationController {
  constructor(
    private readonly emailCredentialService: EmailCredentialService,
    private readonly emailChannelService: EmailChannelService,
    private redisService: RedisService,
  ) {}

  @Post('loginCredential')
  async generateUrl(@Body() body: CreateMailCredential) {
    const { name, projectId, topicName, email, clientId, clientSecret } = body;

    // Genera un identificador temporal
    const state = crypto.randomUUID();

    // Guarda datos temporales por 5 minutos
    await this.redisService.set(
      `oauth_state:${state}`,
      JSON.stringify({
        name,
        projectId,
        topicName,
        email,
        clientId,
        clientSecret,
      }),
      300,
    ); // TT
    return this.emailChannelService.authUrl(
      email,
      clientId,
      clientSecret,
      state,
    );
  }

  @Public()
  @Get('createCredential')
  @Redirect(undefined, 302)
  async createCredentialByEmail(@Query() queryParams: Record<string, any>) {
    const { code, state } = queryParams;

    if (!state) {
      throw new BadRequestException('Missing state parameter');
    }

    // Recuperas datos de Redis
    const saved = await this.redisService.get(`oauth_state:${state}`);
    if (!saved) {
      throw new BadRequestException('Expired or invalid state');
    }

    const body = JSON.parse(saved);

    if (code) {
      await this.emailCredentialService.createCredential(code, body);
    }

    await this.redisService.del(`oauth_state:${state}`);

    return {
      url: `${envConfig.crmUrl}/settings/channels`,
    };
  }

  // @Post('generateGmailCredential')
  // async generateGmailCredential(@Body() body: CreateMailCredential) {
  //   return await this.emailCredentialService.createCredential(body);
  // }

  @Put('setWatch')
  async setWatch() {
    return await this.emailCredentialService.setWatch();
  }

  // @Put('setOAuth')
  // async setOAuth(@Req() req: Request) {
  //   return await this.emailCredentialService.setOAuth();
  // }
}
