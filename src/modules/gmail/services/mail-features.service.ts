import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { MailAttentionRepository } from "../repositories/mail-attention.repository";
import { MailStateRepository } from "../repositories/mail-state.repository";
import { MailFilter } from "../dto/mail-filter.dto";
import { EmailTicketList } from "../email-ticket-list";
import { Op } from "sequelize";
import { MailRepository } from "../repositories/mail.repository";
import { Inbox } from "@modules/inbox/entities/inbox.entity";
import { Channel } from "@modules/channel/entities/channel.entity";
import { MailCredentialRepository } from "../repositories/mail-credential.repository";
import { CenterEmail, GenericEmail } from "../dto/center-email.dto";
import { BuildCenterEmail, BuildEmail } from "../dto/BuildEmail";
import { GmailChannelService } from "./gmail-channel.service";

@Injectable()
export class MailFeaturesService {
    constructor(
        private readonly mailRepository: MailRepository,
        private readonly mailStateRepository: MailStateRepository,
        private readonly mailCredentialRepository:MailCredentialRepository,
        private readonly gmailChannelService:GmailChannelService,
        
    ) { }
    async trashMail(mailthreadId:number){
        const exist = await this.mailRepository.findById(mailthreadId);
        if(!exist) throw new NotFoundException('Correo no existe')
        const trash= await this.mailStateRepository.getTrash();
        if(!trash) throw new InternalServerErrorException('Error interno del servidor',);
        await this.mailRepository.update(mailthreadId,{mailStateId:trash.toJSON().id})
    }
    async mailTrashList(query: MailFilter) {
        const trash = await this.mailStateRepository.getTrash();
        if (!trash) throw new InternalServerErrorException('Error interno del servidor');
        const whereThread: any = {
            mailStateId: trash.toJSON().id
        };
        return await EmailTicketList(whereThread, query, this.mailRepository)
    }
    async mailDraftList(query: MailFilter){
        const draft = await this.mailStateRepository.getDraft();
        if (!draft) throw new InternalServerErrorException('Error interno del servidor');
        const whereThread: any = {
            mailStateId: draft.toJSON().id
        };
        return await EmailTicketList(whereThread, query, this.mailRepository)
    }
    async draftMail(mailthreadId:number){
        const exist = await this.mailRepository.findById(mailthreadId);
        if(!exist) throw new NotFoundException('Correo no existe')
        const draft= await this.mailStateRepository.getDraft();
        if(!draft) throw new InternalServerErrorException('Error interno del servidor',);
        await this.mailRepository.update(mailthreadId,{mailStateId:draft.toJSON().id})
    }
    async SpamMail(mailthreadId:number){
        const exist = await this.mailRepository.findById(mailthreadId);
        if(!exist) throw new NotFoundException('Correo no existe')
        const spam= await this.mailStateRepository.getSpam();
        if(!spam) throw new InternalServerErrorException('Error interno del servidor',);
        await this.mailRepository.update(mailthreadId,{mailStateId:spam.toJSON().id})
    }
     async mailSpamList(query: MailFilter){
        const spam = await this.mailStateRepository.getSpam();
        if (!spam) throw new InternalServerErrorException('Error interno del servidor');
        const whereThread: any = {
            mailStateId: spam.toJSON().id
        };
        return await EmailTicketList(whereThread, query, this.mailRepository)
    }
    async changeSendMail(mailthreadId:number){
        const exist = await this.mailRepository.findById(mailthreadId);
        if(!exist) throw new NotFoundException('Correo no existe')
        const send= await this.mailStateRepository.getSend();
        if(!send) throw new InternalServerErrorException('Error interno del servidor',);
        await this.mailRepository.update(mailthreadId,{mailStateId:send.toJSON().id})
    }
    
    async favoriteUpdate(mailthreadId:number){
        const exist = await this.mailRepository.findById(mailthreadId);
        if(!exist) throw new NotFoundException('Correo no existe');
        const favorite = exist.toJSON().isFavorite ? false:true;
        await this.mailRepository.update(mailthreadId,{isFavorite:favorite})
    }
    async favoriteList(query: MailFilter){
        const send= await this.mailStateRepository.getSend();
        if(!send) throw new InternalServerErrorException('Error interno del servidor');
        const whereThread: any = {
            parentId: { [Op.is]: null,},
            mailStateId: send.toJSON().id,
            isFavorite: true
        };
        return await EmailTicketList(whereThread,query,this.mailRepository)
    }
    async buildGenericEmail(body:GenericEmail) {
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
        if (!credential) throw new NotFoundException('No se encontro la credencial');
        const mail: BuildCenterEmail = {
            from: credential.toJSON().email,
            to: [body.to],
            subject: body.subject,
            text: body.content,
            refreshToken: credential.toJSON().refreshToken,
        }
        if(body.html){
            mail.html = JSON.parse(body.html)
        }
        const email = await this.gmailChannelService.sendEmail(mail)
        return email;
    }
   
}
