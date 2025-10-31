import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InboxRepository } from '@modules/inbox/repositories/inbox.repository';
import { EmailChannelService } from './email-channel.service';
import { EmailCredentialRepository } from '../repositories/email-credential.repository';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { ChannelEnum } from '@common/enums/channel.enum';
import { CreateMailCredential } from '../dto/create-mail-credential.dto';

@Injectable()
export class EmailCredentialService {
  constructor(
    private readonly emailCredentialRepository: EmailCredentialRepository,
    private readonly emailChannelService: EmailChannelService,
    private readonly inboxRepository: InboxRepository,
  ) {}

  async initEmail() {
    const credential = await this.emailCredentialRepository.findOne({
      include: [
        {
          model: Inbox,
          required: true,
          where: { channelId: ChannelEnum.EMAIL },
        },
      ],
    });
    if (!credential) {
      console.log('Sin credenciales de correo');
      return;
    }
    const refreshToken = credential.toJSON().refreshToken;
    if (
      credential.toJSON().refreshToken &&
      credential.toJSON().clientTopic &&
      credential.toJSON().clientSecret &&
      credential.toJSON().clientID &&
      credential.toJSON().clientProject
    ) {
      try {
        const watch = await this.emailChannelService.setWatch(
          refreshToken,
          credential.toJSON().clientTopic,
          credential.toJSON().clientProject,
          credential.toJSON().clientID,
        );
      } catch (error) {
        console.error('Error inicializando las credenciales:', error.message);
      }
    }
  }

  async setWatch() {
    const credential = await this.emailCredentialRepository.findOne({
      include: [
        {
          model: Inbox,
          required: true,
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
      credential.toJSON().clientID,
    );
    return watch;
  }

  async createCredential(code: string, body: CreateMailCredential) {
    try {
      const infoToken = await this.emailChannelService.exchangeCode(
        body.clientId,
        code,
      );
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
      const credential = await this.emailCredentialRepository.create({
        email: body.email,
        inboxId: createdInboxId,
        clientID: body.clientId,
        clientSecret: body.clientSecret,
        clientTopic: body.topicName,
        clientProject: body.projectId,
        refreshToken: infoToken.refreshToken,
      });
      const watch = await this.emailChannelService.setWatch(
        infoToken.refreshToken,
        credential.toJSON().clientTopic,
        credential.toJSON().clientProject,
        credential.toJSON().clientID,
      );
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
