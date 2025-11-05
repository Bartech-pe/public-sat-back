export class EmailRequestDto {
  processCode: number;
  senderCode: number;
  to: string;
  cc?: string;
  bcc?: string | null;
  subject: string;
  message: string;
  documentTypeCode?: number | null;
  documentTypeValue?: string | null;
  terminalName: string;
  attachments: any[];
}
