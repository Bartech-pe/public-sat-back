import { Body, Controller, Post } from '@nestjs/common';
import { MensajeriaService } from './email.service';
import { requestEmail } from './dto/email-request.dto';

@Controller('email')
export class MessagingController {
  constructor(private readonly mensajeriaService: MensajeriaService) {}

  @Post()
  async sendEmail(@Body() body: requestEmail) {
    const response = await this.mensajeriaService.enviarCorreo(body);
    return response;
  }

}