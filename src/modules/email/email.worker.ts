import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailSent } from './dto/center-email.dto';
import { MailType } from './enum/mail-type.enum';
import { EmailWorkerService } from './services/email-worker.service';

@Processor('mail-events')
@Injectable()
export class EmailWorker extends WorkerHost {
  private roundRobinIndex: Record<number, number> = {};

  constructor(private readonly emailWorkerService: EmailWorkerService) {
    super();
  }
  async process(job: Job, token?: string): Promise<void> {
    const start = Date.now();
    try {
      const event = job.data as EmailSent;
      console.log('📩 Procesando evento:', event.messageId);

      // 1️⃣ Validar si ya se procesó antes
      const alreadyProcessed =
        await this.emailWorkerService.getGmailHeaderMessageId(
          event.referencesMail,
        );
      if (alreadyProcessed) {
        console.log('⚠️ Flujo ya procesado anteriormente');
        return;
      }

      // 2️⃣ Flujo de reenvío interno
      const forward = await this.emailWorkerService.caseForwardTo(event);
      if (forward.success) {
        await this.createMailFlow(event, MailType.INTERN_FORWARD, forward);
        return;
      }

      // 3️⃣ Flujo de asesor
      const credentials = await this.emailWorkerService.getSatCredential();
      const advisor = await this.emailWorkerService.caseAdvisor(
        event,
        credentials.email,
      );
      if (advisor.success) {
        await this.createMailFlow(
          event,
          MailType.ADVISOR,
          advisor,
          event.subject,
        );
        return;
      }

      // 4️⃣ Respuesta interna
      const intern = await this.emailWorkerService.caseInternAnswer(event);
      if (intern.success) {
        await this.createMailFlow(
          event,
          MailType.INTERN_REPLY,
          intern,
          event.subject,
        );
        return;
      }

      // 5️⃣ Respuesta dentro del hilo
      const thread = await this.emailWorkerService.caseAnswerInThread(event);
      if (thread.success) {
        await this.createMailFlow(
          event,
          MailType.CITIZEN,
          thread,
          undefined,
          5,
        );
        return;
      }

      // 6️⃣ Flujo de nueva atención
      const { skillId, emailUserJson } =
        await this.emailWorkerService.getAdvisorsAvaliable();

      if (emailUserJson.length === 0) {
        await this.emailWorkerService.createAttention(event, undefined);
      } else {
        const index = this.roundRobinIndex[skillId] || 0;
        const emailUser = emailUserJson[index];
        this.roundRobinIndex[skillId] = (index + 1) % emailUserJson.length;
        await this.emailWorkerService.createAttention(event, emailUser?.userId);
      }

      console.log('✅ Flujo completado en', Date.now() - start, 'ms');
    } catch (error) {
      console.error('❌ Error en process:', error);
    }
  }

  /**
   * 🔹 Función auxiliar para reducir duplicación de código
   */
  private async createMailFlow(
    event: EmailSent,
    type: MailType,
    flowResult:
      | {
          success: boolean;
          type?: undefined;
          attentionId?: undefined;
          state?: undefined;
        }
      | { success: boolean; type: MailType; attentionId: any; state: any },
    subject?: string,
    defaultState?: number,
  ): Promise<void> {
    const state =
      defaultState ??
      (this.emailWorkerService.isReply(subject!) ? 5 : flowResult.state);
    await this.emailWorkerService.createMail(
      event,
      type,
      flowResult.attentionId,
      state,
    );
  }
}
