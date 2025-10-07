export class SMSSendDto {
  SenderId: string;
  MessageParameters: MessageParameter[];
}

export class MessageParameter {
  Number: string;
  Text: string;
}
export class SMSSendResponseDto {
  ErrorCode: number;
  ErrorDescription: string | null;
  Data: SMSData;
}
class SMSData {
  MessageErrorCode: number;
  MessageErrorDescription: string | null;
  MobileNumber: string;
  MessageId: string | null;
  Custom: string | null;
}
export class SMSFilterDto {
  iProcesoOrigen: string;
  vTextoEnviado: string;
  siOpcion: string;
  vNumCelula: string;
  cNomTer: string;
  siCodUsu: string;
  sIdentificadorServicio: string | null;
}
export class SMSFilterResponseDto {
  ErrorCode: number;
  ErrorDescription: string | null;
  Data: SMSData[];
  SchedTime: string | null;
  sCodLoteEnvio: string | null;
  sCodRetorno: string | null;
  sDesRetorno: string | null;
  sFecEmvio: string | null;
  sGroupId: string | null;
  sMessage: string | null;
  sMobileNumbers: string | null;
  siCantidad: number;
}
