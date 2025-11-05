import { User } from "@modules/user/entities/user.entity";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Job } from "bullmq";
import { CenterEmail, EmailSent } from "./dto/center-email.dto";
import { MailType } from "./enum/mail-type.enum";
import { MailWorkerService } from "./services/mail-worker.service";


@Processor('mail-events')
@Injectable()
export class MailWorker extends WorkerHost {
    private roundRobinIndex: Record<number, number> = {};

    constructor(
    private readonly mailWorkerService:MailWorkerService
    ) {
    super();
    }
    async process(job: Job, token?: string): Promise<any> {
        const event = job.data as EmailSent;
        const checkGmail = await this.mailWorkerService.getGmailHeaderMessageId(event.referencesMail)
        if(checkGmail){
            console.log('Flujo ya procesado con anterioridad')
            return;
        }
        const TestForward = await this.mailWorkerService.caseForwardTo(event)
        console.log("TestForward",TestForward)
        if(TestForward.success){
            await this.mailWorkerService.createMail(event,MailType.INTERN_FORWARD,TestForward.attentionId,TestForward.state)
            return;
        }
        const credentials = await this.mailWorkerService.getSatCredential()
        const TestAdvisor = await this.mailWorkerService.caseAdvisor(event,credentials.email)
        console.log("TestAdvisor",TestAdvisor)
        if(TestAdvisor.success){
            const state = this.mailWorkerService.isReply(event.subject) ? 5 :TestAdvisor.state
            await this.mailWorkerService.createMail(event,MailType.ADVISOR,TestAdvisor.attentionId,state)
            return;
        }
        const TestInternAnswer = await this.mailWorkerService.caseInternAnswer(event)
        if(TestInternAnswer.success){
             const state = this.mailWorkerService.isReply(event.subject) ? 5 :TestAdvisor.state
            await this.mailWorkerService.createMail(event,MailType.INTERN_REPLY,TestInternAnswer.attentionId,state)
            return;
        }
        const TestAnswerThread = await this.mailWorkerService.caseAnswerInThread(event)
        console.log("TestAnswerThread",TestAnswerThread)
        if(TestAnswerThread.success){
            await this.mailWorkerService.createMail(event,MailType.CITIZEN,TestAnswerThread.attentionId,5)
            return;
        } 
        const {skillId,emailUserJson} = await this.mailWorkerService.getAdvisorsAvaliable();
        if(emailUserJson.length==0){
             await this.mailWorkerService.createAttention(event,null)
        }
        const index = this.roundRobinIndex[skillId] || 0;
        const emailUser = emailUserJson[index];
        this.roundRobinIndex[skillId] = (index + 1) % emailUserJson.length;
        await this.mailWorkerService.createAttention(event,emailUser.idUser)
        console.log('Flujo Terminado')
        return;
        
    }
}
