import { info } from 'console';
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { MailCredentialRepository } from "../repositories/mail-credential.repository";
import { Inbox } from "@modules/inbox/entities/inbox.entity";
import { MailAttachmentRepository } from "../repositories/mail-attachment.repository";
import { MailAttentionRepository } from "../repositories/mail-attention.repository";
import { EmailSent } from "../dto/center-email.dto";
import { MailType } from "../enum/mail-type.enum";
import { MailStateRepository } from "../repositories/mail-state.repository";
import { MailAttention } from "../entities/mail-attention.entity";
import { EstadoCanalRepository } from "@modules/estado-canal/repositories/estado-canal.repository";
import { EstadoAtencionService } from "@modules/estado-atencion/estado-atencion.service";
import { User } from "@modules/user/entities/user.entity";
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { InboxUserRepository } from "@modules/inbox/repositories/inbox-user.repository";
import { MailAttachment } from '../entities/mail-attachment.entity';
import { Channel } from '@modules/channel/entities/channel.entity';
import { MailRepository } from '../repositories/mail.repository';
import { InboxRepository } from '@modules/inbox/repositories/inbox.repository';
import { EstadoAtencion } from '@modules/estado-atencion/entities/estado-atencion.entity';
import { Role } from '@modules/role/entities/role.entity';
dayjs.extend(utc);
dayjs.extend(timezone);
@Injectable()
export class MailWorkerService {
    constructor(private readonly mailCredentialRepository:MailCredentialRepository,
        private readonly mailAttentionRepository:MailAttentionRepository,
        private readonly mailRepository:MailRepository,
        private readonly mailStateRepository:MailStateRepository,
        private readonly stateChannelRepository:EstadoCanalRepository,
        private readonly estadoAtencion:EstadoAtencionService,
        private readonly inboxUserRepository:InboxUserRepository,
        private readonly mailAttachmentRepository:MailAttachmentRepository,
        private readonly inboxRepository:InboxRepository
    ){

    }
     private generateCode(){
        return Math.random().toString().slice(2, 2 + 6);
    }
    private getMailFormat(email:string){
        const match =email.match(/<(.*?)>/);
        const emailOnly = match ? match[1] : email;
        return emailOnly;
    }
    async getSatCredential(){
        const credential = await this.mailCredentialRepository.findOne({include:[
            {
                model: Inbox,
                include: [{
                    model: Channel,
                    where: { id: 4 },
                }]
            }
        ]});
        if(!credential) throw new NotFoundException('No se encontro la credencial');
        return {email:credential.toJSON().email}
    }
    async caseAdvisor(event:EmailSent,emailGeneral:string){
        const attentionEntity = await this.mailAttentionRepository.findOne({ where: { threadGmailId: event.threadId } })
        if (!attentionEntity) return {success:false};
        const match = event.from.match(/<(.*?)>/);
        const emailOnly = match ? match[1] : event.from;
        if (emailGeneral === emailOnly) {
             const sendState = await this.mailStateRepository.getSend();
            if (!sendState) throw new InternalServerErrorException('Error interno del servidor',);
            return {
                success:true,
                type:MailType.ADVISOR,
                attentionId:attentionEntity.toJSON().id,
                state:sendState.toJSON().id
            }
        }
        return {
            success:false
        }
    }
    async caseForwardTo(event: EmailSent) {
        if (!event.forward) return { success: false };
        const threadEntity = await this.mailRepository.findOne({ where: { messageGmailId: event.forward } })
        if (!threadEntity) return { success: false };
        const sendState = await this.mailStateRepository.getForward();
        if (!sendState) throw new InternalServerErrorException('Error interno del servidor',);
        return {
                success:true,
                type:MailType.INTERN_FORWARD,
                attentionId:threadEntity.toJSON().mailAttentionId,
                state:sendState.toJSON().id
            }

    }
    async caseInternAnswer(event:EmailSent){
        const messageId = event.inReplyTo
            ? await this.mailRepository.findOne({ where: { messageHeaderGmailId: event.inReplyTo } })
            : null;
        if(event.inReplyTo && messageId && messageId.toJSON().type==MailType.INTERN_REPLY){
            const sendState = await this.mailStateRepository.getReply();
            if (!sendState) throw new InternalServerErrorException('Error interno del servidor',); 
           return {
                success:true,
                type:MailType.INTERN_REPLY,
                attentionId:messageId.toJSON().mailAttentionId,
                 state:sendState.toJSON().id
            }
        }
        return {success:false}
    }
    async caseAnswerInThread(event:EmailSent){
        if (!event.inReplyTo) {
            return { success: false };
        }
        const messageId = await this.mailRepository.findOne({ where: { messageHeaderGmailId: event.inReplyTo } });
        if (messageId) {
            const sendState = await this.mailStateRepository.getReply();
            if (!sendState) throw new InternalServerErrorException('Error interno del servidor',);
            return {
                success: true,
                type: MailType.CITIZEN,
                attentionId: messageId.toJSON().mailAttentionId,
                state:sendState.toJSON().id
            }
        }
        return { success: false }
    } 
    async createMail(event: EmailSent, type: MailType,mailAttentionId:number,stateId:number) {
        try{
        const thread = await this.mailRepository.create({
            subject: event.subject,
            content: event.content.find(c => c.mimeType === 'text/plain')?.content || '',
            to: this.getMailFormat(event.to),
            from: this.getMailFormat(event.from),
            mailAttentionId: mailAttentionId,
            mailStateId: stateId,
            isFavorite: false,
            isRead: false,
            messageGmailId: event.messageId,
            messageHeaderGmailId:event.referencesMail,
            referencesMail: event.references,
            inReplyTo: event.inReplyTo,
            type: type,
            createdAt:dayjs().tz('America/Lima').toDate(), 
        })
       
        if(event.attachment){
          const createFiles = event.attachment.map(a=>{
            const attach:Partial<MailAttachment>={
                filename:a.filename,
                mimeType:a.mimeType,
                attachmentGmailId:a.attachmentId,
                mailThreadId:thread.toJSON().id
            }
            return attach;
          })
          await this.mailAttachmentRepository.bulkCreate(createFiles)
        }
        return thread;
       }catch(error){
        console.log(error)
       }
    }
    async getAdvisorsAvaliable(){
        try{
           const stateAvalible = await this.stateChannelRepository.findAvalibleEmail();
        if(!stateAvalible) throw new InternalServerErrorException('Estado no disponible',);
        const stateAvalibleJson = stateAvalible.toJSON();
        const skillId = stateAvalibleJson.id;
       const ibox = await this.inboxRepository.findOne({include: [{
                        model: Channel,
                        where: { id: 4 },
                    }],})
        if (!ibox) throw new NotFoundException('No se encontro la credencial');
        const inboxId = ibox.toJSON().id;
        const emailUsers = await this.inboxUserRepository.findAll({
            where: { stateChannelId:stateAvalibleJson.id,idInbox:inboxId },
            include:[{model:User,include:[{model:Role,where:{id:3}}]}],
            attributes:['idUser']
        });
        const emailUserJson = emailUsers.map(a=>a.toJSON())
        return {skillId,emailUserJson}
        }catch(error){
            console.error(error)
        }
        return { skillId: 0, emailUserJson: [] }

    }
    async createAttention(event: EmailSent, userId: number | null) {
        try {
            let attention: EstadoAtencion | null = null
            let inboxId: number | null = null
            if (userId) {
                const mailUserDto = await this.inboxUserRepository.findOne({
                    where: { idUser: userId },
                    include: [
                        {
                            model: User,
                            as: 'user'
                            , attributes: ['id', 'email']
                        },
                    ],
                })
                const mailUserDtoJson = mailUserDto?.toJSON()
                inboxId = mailUserDtoJson?.idInbox ?? 0,
                attention = await this.estadoAtencion.findbyAtencionAbierta()
            } else {
                attention = await this.estadoAtencion.findbyAtencionSinAsignacion()
            }
            const code = this.generateCode();
            if (!attention) throw new InternalServerErrorException('Error interno del servidor Problemas con la atención asignada',);
            const sendState = await this.mailStateRepository.getSend();
            if (!sendState) throw new InternalServerErrorException('Problemas con el estado de envio',);
            const created = await this.mailAttentionRepository.create({
                emailCitizen: this.getMailFormat(event.from),
                advisorUserId: userId === null ? undefined : userId,
                advisorInboxId: inboxId === null ? undefined : inboxId,
                ticketCode: code,
                threadGmailId: event.threadId,
                stateId: attention.toJSON().id,
                createdAt: dayjs().tz('America/Lima').toDate(),
            })
            const thread = await this.mailRepository.create({
                subject: event.subject,
                content: event.content.find(c => c.mimeType === 'text/plain')?.content || '',
                to: this.getMailFormat(event.to),
                from: this.getMailFormat(event.from),
                mailAttentionId: created.toJSON().id,
                mailStateId: sendState.toJSON().id,
                isFavorite: false,
                isRead: false,
                messageGmailId: event.messageId,
                messageHeaderGmailId: event.referencesMail,
                referencesMail: event.references,
                inReplyTo: event.inReplyTo,
                type: MailType.CITIZEN,
                createdAt: dayjs().tz('America/Lima').toDate(),
            })
            if (event.attachment) {
                const createFiles = event.attachment.map(a => {
                    const attach: Partial<MailAttachment> = {
                        filename: a.filename,
                        mimeType: a.mimeType,
                        attachmentGmailId: a.attachmentId,
                        mailThreadId: thread.toJSON().id
                    }
                    return attach;
                })
                await this.mailAttachmentRepository.bulkCreate(createFiles)
            }
        } catch (error) {
            console.error(error)
        }

    }
    async getGmailHeaderMessageId(messageId:string){
        return await this.mailRepository.findOne({ where: { messageHeaderGmailId: messageId } })
    }
    isReply(subject: string): boolean {
        return /^(Re|R):/i.test(subject.trim());
    }
}
