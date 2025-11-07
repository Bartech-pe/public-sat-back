import { IsArray, IsNumber, IsString } from 'class-validator';

export class SrvSmsMessage {
  @IsNumber()
  codProceso: number;

  @IsNumber()
  codRemitente: number;

  @IsString()
  nomTerminal: string;

  @IsArray()
  mensajes: SrvMessage[];

  @IsString()
  name?: string;
}

export class SrvMessage {
  numTelDestino: string;
  mensaje: string;
  codTipDocumento: number | null;
  valTipDocumento: null | string;
}

export class SmsMessageResponse {
  exito: boolean;
  mensaje: string;
}
