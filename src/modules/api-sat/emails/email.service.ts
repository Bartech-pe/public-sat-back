import { 
  Injectable, 
  InternalServerErrorException,
  Logger 
} from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { apiSatConfig } from 'config/env';
import { requestEmail } from './dto/email-request.dto';

@Injectable()
export class MensajeriaService {
  private readonly logger = new Logger(MensajeriaService.name);
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: apiSatConfig.emailUrl,
      timeout: 30000, 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  async enviarCorreo(correoRequest: requestEmail): Promise<boolean> {
    try {
      const response = await this.client.post('/correo', correoRequest);
      
      if (response.status === 200) {
        this.logger.log(`Correo enviado exitosamente a: ${correoRequest.correoDestino}`);
        return true;
      }

      return false;
      
    } catch (error) {

      throw new InternalServerErrorException('Error al enviar el correo electrónico');
    }
  }
}