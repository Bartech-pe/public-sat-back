import { Injectable, NotFoundException } from "@nestjs/common";
import { GmailChannelService } from "./gmail-channel.service";
import { MailAttachmentRepository } from '../repositories/mail-attachment.repository';
import { AttachementBody } from '../dto/BuildEmail';
import { MailRepository } from "../repositories/mail.repository";
import { Mail } from "../entities/mail.entity";

@Injectable()
export class MailAttachmentService {
    constructor(private readonly gmailChannelService:GmailChannelService,
     private readonly mailRepository:MailRepository,
     private readonly mailAttachmentRepository:MailAttachmentRepository
    ){

    }
    async getFilesByMessageId(mailThreadId:string){
        const files:any[]=[]
        const mailAttachments = await this.mailAttachmentRepository.findAll({where:{mailThreadId:mailThreadId},include:[
            {
              model:Mail,attributes:['messageHeaderGmailId']  
            }
        ]})
        if(!mailAttachments){
            return []
        }
        const messageId = mailAttachments[0].toJSON().mailThread.messageHeaderGmailId
        mailAttachments.forEach(async element => {
             const request:AttachementBody={
                 messageId: messageId,
                 attachmentId: element.attachmentGmailId,
             }
             const file = await this.gmailChannelService.getAtachment(request)
             files.push(file)
        });
        return files;
    }
}
