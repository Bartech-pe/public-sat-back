export class requestEmailFiles {
  nombreArchivo: string;
  codTipoArchivo: number;    
  orden: number;
  base64: string;
}

export class requestEmail {
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
  adjuntos?: requestEmailFiles[];
}