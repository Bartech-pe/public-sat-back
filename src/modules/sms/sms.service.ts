import { SMSFilterDto, SMSSendDto } from '@common/proxy/sms/dto/SMSSendDto';
import { SMSProxy } from '@common/proxy/sms/sms.proxy';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SMSIndividualDto, SMSMAsivoDto } from './dto/sms.dto';

@Injectable()
export class SmsService {
  constructor(private readonly smsProxy: SMSProxy) {}
  async Massive(body: SMSMAsivoDto) {
    const request: SMSSendDto = {
      SenderId: '5115100066',
      MessageParameters: body.MessageParameters,
    };
    const masiveProxy = await this.smsProxy.SMSMasive(request);
    if (!masiveProxy.success || masiveProxy.element == null) {
      throw new InternalServerErrorException(
        `Error con  la consulta de sms genero un ${masiveProxy.statusCode}`,
      );
    }
    return masiveProxy.element;
  }
  async Solo(body: SMSIndividualDto) {
    const request: SMSFilterDto = {
      iProcesoOrigen: '11',
      vTextoEnviado: body.message,
      siOpcion: '1',
      vNumCelula: body.number,
      cNomTer: 'p7a-xxx',
      siCodUsu: '9001',
      sIdentificadorServicio: 'proceso prueba',
    };
    const soloProxy = await this.smsProxy.SMSSolo(request);
    if (!soloProxy.success || soloProxy.element == null) {
      throw new InternalServerErrorException(
        `Error con  la consulta de sms genero un ${soloProxy.statusCode}`,
      );
    }
    return soloProxy.element;
  }
}
