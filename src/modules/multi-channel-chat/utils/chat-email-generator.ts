// utils/chat-email-generator.ts
import * as fs from 'fs/promises';
import * as path from 'path';

interface MessageData {
  content?: string;
  timestamp: string;
  senderType: 'citizen' | 'agent';
  attachments?: AttachmentData[];
  user?: any;
}

interface AttachmentData {
  type: string;
  name?: string;
  extension?: string;
  content?: string;
  fileSize?: number;
}

interface FileIconInfo {
  iconHtml: string;
  backgroundColor: string;
}

export class ChatEmailGenerator {
  
  /**
   * Función principal que genera el HTML completo del email
   */
  static async generateEmailHtml(assistance: any): Promise<string> {
    // Extraer datos de la asistencia
    const { channelRoom, channelMessages, citizen } = this.extractAssistanceData(assistance);
    
    // Cargar template
    const template = await this.loadTemplate();
    
    // Generar contenido de mensajes
    const messagesContent = this.generateMessagesContent(channelMessages, citizen);
    
    // Reemplazar placeholders en el template
    return this.replacePlaceholders(template, {
      citizenName: citizen?.fullName || 'Ciudadano',
      messagesContent: messagesContent
    });
  }

  /**
   * Extrae y organiza los datos de la asistencia
   */
  private static extractAssistanceData(assistance: any) {
    const channelRoom = assistance.get("channelRoom");
    const channelMessages = assistance.get("messages") || [];
    const citizen = channelRoom?.get("citizen");

    return { channelRoom, channelMessages, citizen };
  }

  /**
   * Carga el template HTML desde archivo
   */
  private static async loadTemplate(): Promise<string> {
    const templatePath = path.join(process.cwd(), 'templates', 'chat-email-template.html');
    return await fs.readFile(templatePath, 'utf8');
  }

  /**
   * Reemplaza los placeholders en el template
   */
  private static replacePlaceholders(template: string, data: Record<string, string>): string {
    let result = template;
    
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    });

    // Reemplazar la fecha actual
    const currentDate = new Date().toLocaleDateString('es-PE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    result = result.replace('[FECHA]', currentDate);

    return result;
  }

  /**
   * Genera el HTML de todos los mensajes
   */
  private static generateMessagesContent(messages: any[], citizen: any): string {
    if (!messages || messages.length === 0) {
      return `
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 40px 20px; color: #6b7280; font-size: 14px; font-style: italic;">
              No hay mensajes en esta conversación
            </td>
          </tr>
        </table>
      `;
    }

    return messages.map(msg => this.generateSingleMessageHtml(msg, citizen)).join('');
  }

  /**
   * Genera el HTML de un mensaje individual usando tablas
   */
  private static generateSingleMessageHtml(message: any, citizen: any): string {
    const msgData = message.toJSON();
    const attachments = message.get("attachments") || [];
    
    const isCitizen = msgData.senderType === "citizen";
    const alignment = isCitizen ? "right" : "left";
    const backgroundColor = isCitizen ? "#365f95" : "#ffffff";
    const textColor = isCitizen ? "#ffffff" : "#333333";
    const borderColor = isCitizen ? "transparent" : "#e5e7eb";

    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
        <tr>
          <td align="${alignment}">
            <table cellpadding="0" cellspacing="0" style="max-width: 70%;">
              <tr>
                <td style="
                  background-color: ${backgroundColor}; 
                  color: ${textColor}; 
                  padding: 12px 16px; 
                  border-radius: 18px;
                  border: 1px solid ${borderColor};
                  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                ">
                  ${this.generateMessageContent(msgData.content)}
                  ${this.generateAttachmentsHtml(attachments, isCitizen)}
                  <div style="margin-top: 8px; font-size: 11px; opacity: 0.8; font-weight: bold;">
                    ${this.formatMessageTime(msgData.timestamp)}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Genera el HTML del contenido del mensaje
   */
  private static generateMessageContent(content?: string): string {
    if (!content?.trim()) return '';
    
    // Escapar HTML primero, luego aplicar formato
    const escapedContent = this.escapeHtml(content);
    
    const processedContent = escapedContent
      .replace(/\n/g, "<br/>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: inherit; text-decoration: underline;">$1</a>');
    
    return `<div style="font-size: 14px; line-height: 1.5;">${processedContent}</div>`;
  }

  /**
   * Genera el HTML de todos los adjuntos de un mensaje
   */
  private static generateAttachmentsHtml(attachments: any[], isCitizen: boolean): string {
    if (!attachments || attachments.length === 0) return '';

    const attachmentHtmls = attachments.map(att => {
      if (att.type === "image") {
        return this.generateImageAttachmentHtml(att);
      } else {
        return this.generateFileAttachmentHtml(att, isCitizen);
      }
    });

    return `<div style="margin-top: 12px;">${attachmentHtmls.join('')}</div>`;
  }

  /**
   * Genera HTML para adjunto de imagen usando tablas
   */
  private static generateImageAttachmentHtml(attachment: AttachmentData): string {
    const imageName = attachment.name || `imagen.${attachment.extension || 'jpg'}`;
    
    // Normalizar extensión para mejor compatibilidad
    let mimeType = 'jpeg';
    const ext = attachment.extension?.toLowerCase();
    if (ext === 'png') mimeType = 'png';
    else if (ext === 'gif') mimeType = 'gif';
    else if (ext === 'webp') mimeType = 'webp';
    else if (ext === 'bmp') mimeType = 'bmp';
    
    const imageData = `data:image/${mimeType};base64,${attachment.content}`;

    return `
      <table cellpadding="0" cellspacing="0" style="margin: 10px 0;">
        <tr>
          <td style="border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <img src="${imageData}" 
                 alt="${this.escapeHtml(imageName)}" 
                 style="
                   display: block; 
                   max-width: 300px; 
                   max-height: 400px; 
                   width: auto; 
                   height: auto;
                   border: none;
                 " />
            <div style="
              background-color: rgba(0,0,0,0.7); 
              color: white; 
              padding: 8px 12px; 
              font-size: 12px; 
              font-weight: bold;
            ">
              ${this.escapeHtml(imageName)}
            </div>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Genera HTML para adjunto de archivo usando tablas
   */
  private static generateFileAttachmentHtml(attachment: AttachmentData, isCitizen: boolean): string {
    const fileName = attachment.name || `archivo.${attachment.extension || 'file'}`;
    const { iconHtml, backgroundColor } = this.getFileIconInfo(attachment.extension);
    const fileSize = attachment.fileSize ? this.formatFileSize(attachment.fileSize) : '';
    
    const containerBg = isCitizen ? 'rgba(255,255,255,0.95)' : '#ffffff';
    const borderColor = isCitizen ? 'rgba(255,255,255,0.3)' : '#e5e7eb';

    return `
      <table cellpadding="0" cellspacing="0" style="
        margin: 10px 0; 
        background-color: ${containerBg}; 
        border: 1px solid ${borderColor}; 
        border-radius: 8px;
        max-width: 300px;
      ">
        <tr>
          <td style="padding: 12px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="
                  width: 40px; 
                  height: 40px; 
                  background-color: ${backgroundColor}; 
                  text-align: center; 
                  vertical-align: middle; 
                  border-radius: 6px;
                  font-size: 12px;
                  font-weight: bold;
                  color: white;
                ">
                  ${iconHtml}
                </td>
                <td style="padding-left: 12px; vertical-align: middle;">
                  <div style="
                    font-weight: bold; 
                    font-size: 13px; 
                    color: #1f2937; 
                    margin-bottom: 4px;
                    word-break: break-all;
                  ">
                    ${this.escapeHtml(fileName)}
                  </div>
                  <div style="font-size: 11px; color: #6b7280;">
                    <span style="
                      background-color: #f3f4f6; 
                      color: #6b7280; 
                      padding: 2px 6px; 
                      border-radius: 4px; 
                      font-weight: bold;
                      margin-right: 8px;
                    ">
                      ${(attachment.extension || 'FILE').toUpperCase()}
                    </span>
                    ${fileSize ? `<span>${fileSize}</span>` : ''}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }

  /**
   * Formatea la hora del mensaje
   */
  private static formatMessageTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString("es-PE", {
      hour: "2-digit", 
      minute: "2-digit"
    });
  }

  /**
   * Obtiene información del ícono según la extensión del archivo
   */
  private static getFileIconInfo(extension?: string): FileIconInfo {
    const ext = extension?.toLowerCase() || '';
    
    const iconMap: Record<string, FileIconInfo> = {
      'pdf': { iconHtml: 'PDF', backgroundColor: '#ef4444' },
      'doc': { iconHtml: 'DOC', backgroundColor: '#3b82f6' },
      'docx': { iconHtml: 'DOC', backgroundColor: '#3b82f6' },
      'xls': { iconHtml: 'XLS', backgroundColor: '#10b981' },
      'xlsx': { iconHtml: 'XLS', backgroundColor: '#10b981' },
      'csv': { iconHtml: 'CSV', backgroundColor: '#10b981' },
      'zip': { iconHtml: 'ZIP', backgroundColor: '#f59e0b' },
      'rar': { iconHtml: 'RAR', backgroundColor: '#f59e0b' },
      '7z': { iconHtml: '7Z', backgroundColor: '#f59e0b' },
      'txt': { iconHtml: 'TXT', backgroundColor: '#f97316' },
      'png': { iconHtml: 'IMG', backgroundColor: '#8b5cf6' },
      'jpg': { iconHtml: 'IMG', backgroundColor: '#8b5cf6' },
      'jpeg': { iconHtml: 'IMG', backgroundColor: '#8b5cf6' },
    };

    return iconMap[ext] || { iconHtml: 'DOC', backgroundColor: '#6b7280' };
  }

  /**
   * Formatea el tamaño del archivo en formato legible
   */
  private static formatFileSize(sizeInBytes: number): string {
    if (sizeInBytes === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = sizeInBytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  /**
   * Función auxiliar para escapar HTML
   */
  private static escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}