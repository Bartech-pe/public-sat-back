import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InboxRepository } from '@modules/inbox/repositories/inbox.repository';
import { EmailChannelService } from './email-channel.service';
import { EmailCredentialRepository } from '../repositories/email-credential.repository';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { Channel } from '@modules/channel/entities/channel.entity';
import { CreateMailCredential } from '../dto/create-mail-credential.dto';
import { CategoryChannelEnum } from '@common/enums/category-channel.enum';
import { ChannelEnum } from '@common/enums/channel.enum';

@Injectable()
export class EmailCredentialService {
  constructor(
    private readonly emailCredentialRepository: EmailCredentialRepository,
    private readonly emailChannelService: EmailChannelService,
    private readonly inboxRepository: InboxRepository,
  ) {}

  async refreshNewToken(code: string) {
    const credential = await this.emailCredentialRepository.findOne({
      include: [
        {
          model: Inbox,
          where: { channelId: ChannelEnum.EMAIL },
        },
      ],
    });
    if (!credential)
      throw new InternalServerErrorException('no existe la credencial');
    const infoToken = await this.emailChannelService.exchangeCode(code);
    const credentialId = credential?.toJSON().id;
    const updated = await this.emailCredentialRepository.update(credentialId, {
      refreshToken: infoToken.refreshToken,
      email: infoToken.email,
    });
    const oAuth = await this.emailChannelService.setOAuth(
      credential.toJSON().clientID,
      credential.toJSON().clientSecret,
    );
    const watch = await this.emailChannelService.setWatch(
      infoToken.refreshToken,
      credential.toJSON().clientTopic,
      credential.toJSON().clientProject,
    );
    return updated;
  }
  async setOAuth() {
    const credential = await this.emailCredentialRepository.findOne({
      include: [
        {
          model: Inbox,
          where: { channelId: ChannelEnum.EMAIL },
        },
      ],
    });
    if (!credential)
      throw new InternalServerErrorException('no existe la credencial');
    const email = await this.emailChannelService.setOAuth(
      credential.toJSON()?.clientID,
      credential.toJSON()?.clientSecret,
    );
    if (credential.toJSON().refreshToken) {
      await this.emailChannelService.refreshSetToken(
        credential.toJSON().refreshToken,
      );
    }
    return email;
  }
  async setWatch() {
    const credential = await this.emailCredentialRepository.findOne({
      include: [
        {
          model: Inbox,
          where: { channelId: ChannelEnum.EMAIL },
        },
      ],
    });
    if (!credential)
      throw new InternalServerErrorException('no existe la credencial');
    if (!credential.toJSON().refreshToken)
      throw new InternalServerErrorException('no existe el refresh token');
    const watch = await this.emailChannelService.setWatch(
      credential.toJSON().refreshToken,
      credential.toJSON().clientTopic,
      credential.toJSON().clientProject,
    );
    return watch;
  }

  async createCredential(body: CreateMailCredential) {
    try {
      const checkInbox = await this.inboxRepository.findOne({
        where: { channelId: ChannelEnum.EMAIL },
      });
      if (checkInbox)
        throw new InternalServerErrorException('Ya existe la credencial');
      const createdInbox = await this.inboxRepository.create({
        name: body.name,
        channelId: ChannelEnum.EMAIL,
      });
      const createdInboxId = createdInbox.toJSON().id;
      const mailCompleted = await this.emailCredentialRepository.create({
        email: body.email,
        inboxId: createdInboxId,
        clientID: body.clientId,
        clientSecret: body.clientSecret,
        clientTopic: body.topicName,
        clientProject: body.projectId,
      });
      const oAuth = await this.emailChannelService.setOAuth(
        body.clientId,
        body.clientSecret,
      );
      return oAuth;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('no existe el refresh token');
    }
  }

  async deleteEmailInbox() {
    const inbox = await this.inboxRepository.findOne({
      where: { channelId: ChannelEnum.EMAIL },
    });

    if (inbox?.toJSON()?.id) {
      this.inboxRepository.delete(inbox?.toJSON()?.id);
    }
  }
}
