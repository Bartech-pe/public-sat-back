import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CenterEmail {
  @IsString()
  subject: string;

  @IsString()
  content: string;

  @IsString()
  to: string;

  @IsNumber()
  mailAttentionId: number;
}
export class GenericEmail {
  @IsString()
  subject: string;

  @IsString()
  content: string;

  @IsString()
  to: string;

  @IsString()
  @IsOptional()
  html?: string;
}
export class EmailSent {
  messageId: string;
  referencesMail: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  references?: string | null;
  inReplyTo?: string | null;
  content: EmailSentContent[];
  forward?: string | null;
  attachment: AttachmentContent[];
}
export class EmailSentContent {
  mimeType: string;
  content: string;
}
export class AttachmentContent {
  attachmentId: string;
  filename: string;
  mimeType: string;
}
export class GmailFileExport {
  @IsString()
  mimeType: string;

  @IsString()
  messageId: string;

  @IsString()
  attachmentId: string;

  @IsString()
  filename: string;
}
