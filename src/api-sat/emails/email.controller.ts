import { Body, Controller, Post } from '@nestjs/common';
import { MensajeriaService } from './email.service';
import { EmailRequestDto } from './dto/email-request.dto';
import { CorreoRequestDto } from '@common/proxy/mensajeria/dto/correo-request.dto';

@Controller('email')
export class MessagingController {
  constructor(private readonly mensajeriaService: MensajeriaService) {}

  @Post()
  async sendEmail(@Body() body: EmailRequestDto) {
    const correoRequest: CorreoRequestDto = {
      codProceso: body.processCode,
      codRemitente: body.senderCode,
      correoDestino: body.to,
      correoConCopia: body.cc,
      correoConCopiaOculta: body.bcc ?? null,
      asunto: body.subject,
      mensaje: body.message,
      codTipDocumento: body.documentTypeCode ?? null,
      valTipDocumento: body.documentTypeValue ?? null,
      nomTerminal: body.terminalName,
      adjuntos: body.attachments ?? [],
    };

    const ok = await this.mensajeriaService.enviarCorreo(correoRequest);
    return { success: ok };
  }
}
