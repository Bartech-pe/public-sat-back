import { ConsoleLogger, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { MailCredentialRepository } from "../repositories/mail-credential.repository";
import { GmailChannelService } from "./gmail-channel.service";
import { info } from "console";
import { InboxRepository } from "@modules/inbox/repositories/inbox.repository";
import { ChannelRepository } from "@modules/channel/repositories/channel.repository";
import { Op } from "sequelize";
import { UserRepository } from "@modules/user/repositories/user.repository";
import { EstadoCanalRepository } from "@modules/estado-canal/repositories/estado-canal.repository";
import { Inbox } from "@modules/inbox/entities/inbox.entity";
import { CreateMailCredential } from "../dto/create-mail-credential.dto";
import { Channel } from "@modules/channel/entities/channel.entity";

@Injectable()
export class MailCredentialService {
    constructor(private readonly mailCredentialRepository:MailCredentialRepository,
    private readonly gmailChannelService:GmailChannelService,
    private readonly inboxRepository:InboxRepository,
    private readonly channelRepository:ChannelRepository,
    ){

    }
    async refreshNewToken(code:string){
        const credential = await this.mailCredentialRepository.findOne({
            include: [
                {
                    model: Inbox,
                    include: [{
                        model: Channel,
                        where: { id: 4 },
                    }],
                }
            ]
        });
        if (!credential) throw new InternalServerErrorException('no existe la credencial');
        const infoToken = await this.gmailChannelService.exchangeCode(code)
        const credentialId = credential?.toJSON().id
        const updated = await this.mailCredentialRepository.update(credentialId, {
            refreshToken: infoToken.refreshToken,
            email: infoToken.email
        })
        const oAuth = await this.gmailChannelService.setOAuth(credential.toJSON().clientID,credential.toJSON().clientSecret)
        const watch = await this.gmailChannelService.setWatch(infoToken.refreshToken,credential.toJSON().clientTopic,credential.toJSON().clientProject)
        return updated;
    }
    async setOAuth(){
       const credential = await this.mailCredentialRepository.findOne({
            include: [
                {
                    model: Inbox,
                    include: [{
                        model: Channel,
                        where: { id: 4 },
                    }],
                }
            ]
        });
        if (!credential) throw new InternalServerErrorException('no existe la credencial');
        const email =  await this.gmailChannelService.setOAuth(credential.toJSON()?.clientID,credential.toJSON()?.clientSecret)
        if (credential.toJSON().refreshToken){
            await this.gmailChannelService.refreshSetToken(credential.toJSON().refreshToken)
         }
         return email;
    }
    async setWatch(){
         const credential = await this.mailCredentialRepository.findOne({
            include: [
                {
                    model: Inbox,
                    include: [{
                        model: Channel,
                        where: { id: 4 },
                    }],
                }
            ]
        });
        if (!credential) throw new InternalServerErrorException('no existe la credencial');
         if (!credential.toJSON().refreshToken) throw new InternalServerErrorException('no existe el refresh token');
        const watch = await this.gmailChannelService.setWatch(credential.toJSON().refreshToken,credential.toJSON().clientTopic,credential.toJSON().clientProject)
        return watch;

    }

    async createCredential(body:CreateMailCredential){
        try {
            const channelMail = await this.channelRepository.findById(4)
        if (!channelMail) throw new NotFoundException('No se encontro el canal email')
        const emailId = channelMail.toJSON().id;
        const checkInbox= await this.inboxRepository.findOne({where:{idChannel:emailId}})
        if (checkInbox) throw new InternalServerErrorException('Ya existe la credencial');
        const createdInbox = await this.inboxRepository.create({
            name: 'Sat-Mail',
            status: true,
            idChannel: emailId,
        })
        const createdInboxId = createdInbox.toJSON().id
        const mailCompleted = await this.mailCredentialRepository.create({
            email: body.email,
            inboxId: createdInboxId,
            clientID: body.clientId,
            clientSecret:body.clientSecret,
            clientTopic:body.topicName,
            clientProject:body.projectId
        })
        const oAuth = await this.gmailChannelService.setOAuth(body.clientId,body.clientSecret)
        return mailCompleted;
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException('no existe el refresh token');
        }
    }
   
}
