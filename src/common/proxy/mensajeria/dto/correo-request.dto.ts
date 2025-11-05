export class CorreoRequestDto {
  codProceso: number;
  codRemitente: number;
  correoDestino: string;
  correoConCopia?: string;
  correoConCopiaOculta?: string | null;
  asunto: string;
  mensaje: string;
  codTipDocumento?: number | null;
  valTipDocumento?: string | null;
  nomTerminal: string;
  adjuntos: any[];
}
