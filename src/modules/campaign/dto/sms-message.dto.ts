import { IsArray, IsNumber, IsString } from 'class-validator';

export class SmsMessageChannel {
  @IsNumber()
  codProceso: number;

  @IsNumber()
  codRemitente: number;

  @IsString()
  nomTerminal: string;

  @IsArray()
  mensajes: Message[];
}

export class Message {
  numTelDestino: string;
  mensaje: string;
  codTipDocumento: number | null;
  valTipDocumento: null | string;
}

export class SmsMessageResponse {
  exito: boolean;
  mensaje: string;
}
