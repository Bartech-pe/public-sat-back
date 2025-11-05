import { Op, where } from 'sequelize';
import { Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from "@nestjs/common";
import { MailAttentionRepository } from "../repositories/mail-attention.repository";
import { EstadoAtencionService } from "@modules/estado-atencion/estado-atencion.service";
import { ReplyCenterMail } from "../dto/reply-center-mail.dto";
import { EstadoAtencion } from "@modules/estado-atencion/entities/estado-atencion.entity";
import { MailAttention } from "../entities/mail-attention.entity";
import { MailFilter } from "../dto/mail-filter.dto";
import { formatDateTime } from "@common/helpers/time.helper";
import { MailStateRepository } from "../repositories/mail-state.repository";
import { EmailTicketList, GetTypeEmail } from "../email-ticket-list";
import { RequestContextService } from "@common/context/request-context.service";
import { MailState } from "../entities/mail-state.entity";
import { GmailChannelService } from "./gmail-channel.service";
import { ReplyEmail } from "../dto/gmailChannel/reply-email.dto";
import { ForwardTo } from "../dto/gmailChannel/forward-to.dto";
import { ForwardCenterMail } from "../dto/forward-center-mail.dto";
import { InboxUserRepository } from "@modules/inbox/repositories/inbox-user.repository";
import { EstadoCanalRepository } from '@modules/estado-canal/repositories/estado-canal.repository';
import { CenterEmail } from '../dto/center-email.dto';
import { AttachementBody, BuildCenterEmail, BuildEmail, FileEmail } from '../dto/BuildEmail';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { MailCredentialRepository } from '../repositories/mail-credential.repository';
import { MailWorkerService } from './mail-worker.service';
import { MailType } from '../enum/mail-type.enum';
import { MailAttachmentRepository } from '../repositories/mail-attachment.repository';
import { groupBy } from '@common/helpers/group.helper';
import { Channel } from '@modules/channel/entities/channel.entity';
import { MailRepository } from '../repositories/mail.repository';
import { InboxRepository } from '@modules/inbox/repositories/inbox.repository';
import { User } from '@modules/user/entities/user.entity';
import { Role } from '@modules/role/entities/role.entity';
import { Mail } from '../entities/mail.entity';

@Injectable()
export class MailCenterService implements OnModuleInit{
    constructor(
        private readonly mailAttentionRepository: MailAttentionRepository,
        private readonly estadoAtencion: EstadoAtencionService,
        private readonly mailRepository: MailRepository,
        private readonly mailStateRepository:MailStateRepository,
        private readonly gmailChannelService:GmailChannelService,
        private readonly inboxUserRepository:InboxUserRepository,
        private readonly stateChannelRepository:EstadoCanalRepository,
        private readonly mailCredentialRepository:MailCredentialRepository,
        private readonly mailWorkerService:MailWorkerService,
        private readonly attachmentRepository:MailAttachmentRepository,
        private readonly inboxRepository:InboxRepository,
    ) { }
    async onModuleInit() {
        const credential = await this.mailCredentialRepository.findOne({
            include: [
                {
                    model: Inbox,
                    include:[{
                       model:Channel,
                       where:{ id:4},
                    }],
                }
            ]
        });
        if (!credential){
            console.log('Sin credencial')
            return;
        }
        const refreshToken = credential.toJSON().refreshToken;
        if (credential.toJSON().refreshToken && credential.toJSON().clientTopic && credential.toJSON().clientSecret && credential.toJSON().clientID && credential.toJSON().clientProject){
        try{
            const oAuth = await this.gmailChannelService.setOAuth(credential.toJSON().clientID,credential.toJSON().clientSecret)
            const watch = await this.gmailChannelService.setWatch(refreshToken,credential.toJSON().clientTopic,credential.toJSON().clientProject)
        }catch(error){
            console.error('❌ Error inicializando las credenciales:', error.message);
        }
    
        }
    }
    async CloseTicket(mailAttentionId: number) {
        const exist = await this.mailAttentionRepository.findById(mailAttentionId)
        if (!exist) {
            throw new NotFoundException('No se encontro el ticket',);
        }
        const attention = await this.estadoAtencion.findbyAtencionCerrada()
        if (!attention) throw new NotFoundException('No se encontro el estado');
        const date = new Date()
        const updated = await this.mailAttentionRepository.update(mailAttentionId,{stateId:attention.toJSON().id,closedAt:date})
        return {status:'Success',message:'Ticket Cerrado'}
    }
    async AttenttionTicket(mailAttentionId: number) {
        const exist = await this.mailAttentionRepository.findById(mailAttentionId)
        if (!exist) {
            throw new NotFoundException('No se encontro el ticket',);
        }
        const attention = await this.estadoAtencion.findbyAtencionEnLinea()
        if (!attention) throw new NotFoundException('No se encontro el estado');
        const updated = await this.mailAttentionRepository.update(mailAttentionId,{stateId:attention.toJSON().id})
        return {status:'Success',message:'Ticket en Atención'}
    }
    async NoWisTicket(mailAttentionId: number) {
        const exist = await this.mailAttentionRepository.findById(mailAttentionId)
        if (!exist) {
            throw new NotFoundException('No se encontro el ticket',);
        }
        const attention = await this.estadoAtencion.findbyAtencionNoDeseado()
        if (!attention) throw new NotFoundException('No se encontro el estado');
        const updated = await this.mailAttentionRepository.update(mailAttentionId,{stateId:attention.toJSON().id})
        return {status:'Success',message:'Ticket en Atención'}
    }
    async RespondMail(body:ReplyCenterMail){
        const mailAttentionId= body.mailAttentionId;
        const mailThreads = await this.mailRepository.findAll({where:{mailAttentionId:mailAttentionId},order: [['createdAt', 'ASC']],include:[
            {model:MailAttention,attributes:['threadGmailId']}
        ]})
        const mailThread = mailThreads[0]
        if(!mailThread) throw new NotFoundException('No se encontro el hilo del correo');
        const mailthreadJson = mailThread.toJSON();
        const messageId = mailthreadJson.messageGmailId;
        const request:ReplyEmail={
            messageId: messageId,
            content: body.content,
            threadId: mailthreadJson.mailAttention.threadGmailId
        }
        await this.gmailChannelService.replyEmail(request)
    }
    async ForwardTo(body:ForwardCenterMail){
        const mailAttentionId= body.mailAttentionId;
        const mailThreads = await this.mailRepository.findAll({where:{mailAttentionId:mailAttentionId},order: [['createdAt', 'ASC']],include:[
            {model:MailAttention,attributes:['threadGmailId']}
        ]})
        const mailThread = mailThreads[0]
        if(!mailThread) throw new NotFoundException('No se encontro el hilo del correo');
        const mailthreadJson = mailThread.toJSON();
        const messageId = mailthreadJson.messageGmailId;
        const request:ForwardTo={
            messageId: messageId,
            forwardTo: body.from
        }
        await this.gmailChannelService.forwardTo(request)
        const state = await this.estadoAtencion.findbyAtencionPendiente();
        if(!state) throw new NotFoundException('estado no encontrado')
        await this.mailAttentionRepository.update(mailAttentionId,{stateId:state.toJSON().id})
    }
    async GetTicketsByAdvisorEmailId(query:MailFilter){
        const send= await this.mailStateRepository.getSend();
        if(!send) throw new InternalServerErrorException('Error interno del servidor');
        const whereThread: any = {
            mailStateId: send.toJSON().id
        };
        const fullUser = RequestContextService.get<any>('user');
        if(fullUser.role.name=='asesor'){
            query.advisorEmailId= fullUser.id
        }
        return await EmailTicketList(whereThread,query,this.mailRepository)
    }
    async getTicketsOpen(query:MailFilter){
        const attention = await this.estadoAtencion.findbyAtencionAbierta()
        if (!attention) throw new NotFoundException('No se encontro el estado');
        query.stateId = attention.toJSON().id;
        const send= await this.mailStateRepository.getSend();
        if(!send) throw new InternalServerErrorException('Error interno del servidor');
          const whereThread: any = {
            mailStateId: send.toJSON().id
        };
        const fullUser = RequestContextService.get<any>('user');
        if(fullUser.role.name=='asesor'){
            query.advisorEmailId= fullUser.id
        }
         return await EmailTicketList(whereThread,query,this.mailRepository)
    }
     async getTicketsClose(query:MailFilter){
        const attention = await this.estadoAtencion.findbyAtencionCerrada()
        if (!attention) throw new NotFoundException('No se encontro el estado');
        query.stateId = attention.toJSON().id;
        const send= await this.mailStateRepository.getSend();
        if(!send) throw new InternalServerErrorException('Error interno del servidor');
          const whereThread: any = {
            mailStateId: send.toJSON().id
        };
        const fullUser = RequestContextService.get<any>('user');
        if(fullUser.role.name=='asesor'){
            query.advisorEmailId= fullUser.id
        }
         return await EmailTicketList(whereThread,query,this.mailRepository)
    } 
    async getTicketsNoAdvisor(query:MailFilter){
        const attention = await this.estadoAtencion.findbyAtencionSinAsignacion()
        if (!attention) throw new NotFoundException('No se encontro el estado');
        query.stateId = attention.toJSON().id;
        const send= await this.mailStateRepository.getSend();
        if(!send) throw new InternalServerErrorException('Error interno del servidor');
          const whereThread: any = {
            mailStateId: send.toJSON().id
        };
        const fullUser = RequestContextService.get<any>('user');
        if(fullUser.role.name=='asesor'){
            query.advisorEmailId= fullUser.id
        }
         return await EmailTicketList(whereThread,query,this.mailRepository)
    } 
    async getTicketsPending(query:MailFilter){
        const attention = await this.estadoAtencion.findbyAtencionPendiente()
        if (!attention) throw new NotFoundException('No se encontro el estado');
        query.stateId = attention.toJSON().id;
        const send= await this.mailStateRepository.getSend();
        if(!send) throw new InternalServerErrorException('Error interno del servidor');
          const whereThread: any = {
            mailStateId: send.toJSON().id
        };
        const fullUser = RequestContextService.get<any>('user');
        if(fullUser.role.name=='asesor'){
            query.advisorEmailId= fullUser.id
        }
        query.type = MailType.INTERN_REPLY;
        return await EmailTicketList(whereThread,query,this.mailRepository)
    }
    async getTicketsNoWish(query:MailFilter){
        const attention = await this.estadoAtencion.findbyAtencionNoDeseado()
        if (!attention) throw new NotFoundException('No se encontro el estado');
        query.stateId = attention.toJSON().id;
        const send= await this.mailStateRepository.getSend();
        if(!send) throw new InternalServerErrorException('Error interno del servidor');
          const whereThread: any = {
            mailStateId: send.toJSON().id
        };
        const fullUser = RequestContextService.get<any>('user');
        if(fullUser.role.name=='asesor'){
            query.advisorEmailId= fullUser.id
        }
         return await EmailTicketList(whereThread,query,this.mailRepository)
    } 
    async getEmailFile(messageId:string,attachmentId:string,mimeType:string,filename:string){
        const attachBody:AttachementBody={
            messageId: messageId,
            attachmentId: attachmentId,
            mimeType: mimeType,
            filename: filename
        }
        try{
            const file = await this.gmailChannelService.getAtachmentv2(attachBody)
            return file;
        }
        catch(error){
            throw new InternalServerErrorException(`Error al descargar archivo ${attachmentId}:`, error.message);
        } 
    }
    async GetEmailAttentionDetail(mailAttentionId:number) {
        const attention = await this.estadoAtencion.findbyAtencionAbierta()
        const id = attention?.toJSON().id;
        const tickets = await this.mailRepository.findAll({
            where: {
                mailAttentionId: mailAttentionId,
            },
            attributes:['id','subject','content','mailAttentionId','from','to','createdAt','inReplyTo','type'],
            include: [
                {
                    model: MailAttention,
                    attributes: ['ticketCode', 'emailCitizen'],
                    include: [
                        {
                            model: EstadoAtencion,
                            attributes: ['nombre','id']
                        },
                    ]
                }, 
                {
                    model:MailState,
                    attributes:['name']
                }
            ]
        })
        const elements = tickets.map(a=>a.toJSON())
        if(elements.length==0) return []
        const files = await this.attachmentRepository.findAll({
            attributes:['id','filename','attachmentGmailId','mailThreadId','mimeType'],
            where: {
                mailThreadId: { [Op.in]: elements.map(e => e.id) }
            },
            include:[{model:Mail,attributes:['messageGmailId']}]
        })
        const filesJson = files.map(a=>a.toJSON())
        const filesgroup = groupBy(filesJson,(file)=>file.mailThreadId ?? '')
        const ticketsJson = elements.map(json => {
            return {
                id: json.id,
                subject: json.subject,
                mailAttentionId: json.mailAttentionId,
                ticketCode: json.mailAttention.ticketCode,
                from: json.from,
                to:json.to,
                state: json.mailState.name,
                content:json.content,
                isAnswer: json.inReplyTo ? true:false,
                open: json.mailAttention.state.id == id,
                date: (json.createdAt),
                type:GetTypeEmail(json.type),
                files:filesgroup[json.id]
            }
        })
        return ticketsJson;
    }
    async balanceAdvisors(){
        const attention = await this.estadoAtencion.findbyAtencionAbierta()
        if (!attention) throw new NotFoundException('No se encontro el estado');
        const noAttention = await this.estadoAtencion.findbyAtencionSinAsignacion()
        if (!noAttention) throw new NotFoundException('No se encontro el estado');
        const attentionId = attention.toJSON().id;
        const noAttentionId = noAttention.toJSON().id;
        const stateAvalible = await this.stateChannelRepository.findAvalibleEmail();
        if(!stateAvalible) throw new InternalServerErrorException('Estado no disponible',);
        const stateAvalibleJson = stateAvalible.toJSON();
        const ibox = await this.inboxRepository.findOne({
            include: [{
                model: Channel,
                where: { id: 4 },
            }],
        })
        if (!ibox) throw new NotFoundException('No se encontro la credencial');
        const inboxId = ibox.toJSON().id;
        const emailUsers = await this.inboxUserRepository.findAll({
            where: { stateChannelId:stateAvalibleJson.id,idInbox:inboxId },
            include:[{model:User,include:[{model:Role,where:{id:3}}]}],
            attributes:['idUser']
        });
        const emailUserJson = emailUsers.map(a=>a.toJSON())
        if(emailUserJson.length==0){
            throw new NotFoundException('Por el momento no se encontraron asesores disponibles');
        }
        const availableUserIds = emailUserJson.map(user => user.idUser);
        const opensData = await this.mailAttentionRepository.findAll({ where: { stateId: { [Op.in]: [attentionId, noAttentionId] } } })
        const opens = opensData.map(a=>a.toJSON())
        const caseCounts = new Map<number, number>();
        availableUserIds.forEach(userId => {
            caseCounts.set(userId, 0);
        });
        const unassignedCases: any[] = [];
        opens.forEach(openCase => {
            if (openCase.advisorUserId && availableUserIds.includes(openCase.advisorUserId)) {
                caseCounts.set(openCase.advisorUserId, (caseCounts.get(openCase.advisorUserId) || 0) + 1);
            } else {
                unassignedCases.push(openCase);
            }
        });
        const allCases = [...opens];
        for (const openCase of allCases) {
            let leastLoaded = Array.from(caseCounts.entries()).sort((a, b) => a[1] - b[1])[0];
            if (!leastLoaded) continue;
            if (!openCase.advisorUserId || !availableUserIds.includes(openCase.advisorUserId)) {
                openCase.advisorUserId = leastLoaded[0];
                await this.mailAttentionRepository.update(openCase.id, {
                    advisorUserId: leastLoaded[0],
                    advisorInboxId: inboxId,
                    stateId:attentionId
                });
                caseCounts.set(leastLoaded[0], leastLoaded[1] + 1);
            } else {
                let currentLoad = caseCounts.get(openCase.advisorUserId)!;
                if (currentLoad > leastLoaded[1] + 1) {
                    caseCounts.set(openCase.advisorUserId, currentLoad - 1);
                    openCase.advisorUserId = leastLoaded[0];
                    await this.mailAttentionRepository.update(openCase.id, {
                        advisorUserId: leastLoaded[0],
                    });
                    caseCounts.set(leastLoaded[0], leastLoaded[1] + 1);
                }

            }

        }
        const userLoads = Array.from(caseCounts.entries()).map(([userId, caseCount]) => ({
            userId,
            caseCount,
            cases: opens.filter(c => c.advisorUserId === userId).map(c => c.id)
        }));
        return userLoads;
    }
    async SendEmail(body: CenterEmail,files:{ attachments?: Express.Multer.File[] }) {
        const credential = await this.mailCredentialRepository.findOne({
            include: [
                {
                    model: Inbox,
                    include:[{
                       model:Channel,
                       where:{ id:4},
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
        if(files.attachments){
            const attachments:FileEmail[]=[]
            for (const file of files.attachments){
                 const newAttachmnent:FileEmail={
                     filename: `${file.originalname}`,
                     content: file.buffer,
                     mimeType: file.mimetype
                 }
                 attachments.push(newAttachmnent)
            }
            mail.attachments = attachments;
        }
        const email = await this.gmailChannelService.sendEmail(mail)
        const sendState = await this.mailStateRepository.getSend();
        if (!sendState) throw new InternalServerErrorException('Error interno del servidor',);
        await this.mailWorkerService.createMail(email,MailType.CITIZEN,body.mailAttentionId,sendState.toJSON().id)
    }
}
