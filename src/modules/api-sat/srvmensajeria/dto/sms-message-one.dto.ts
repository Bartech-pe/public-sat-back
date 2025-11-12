import {IsNumber, IsString } from 'class-validator';

export class SrvSmsMessageOne {
  @IsNumber()
  codProceso: number;

  @IsNumber()
  codRemitente: number;

  @IsString()
  numTelDestino?: string;

  @IsString()
  mensaje?: string;

  @IsString()
  codTipDocumento?: string;

  @IsString()
  valTipDocumento?: string;

  @IsString()
  nomTerminal: string;
}


