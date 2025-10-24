import { Attachment } from '@common/interfaces/channel-connector/incoming/incoming.interface';
import { ChannelCitizen } from '../channel-citizen/channel-citizen.interface';
import { ChannelAttentionDto } from '@modules/multi-channel-chat/dto/channel-attentions/get-assistance.dto';
import { ChannelAttentionSummariesDTO } from '../channel-room/channel-room-summary.dto';


/** ================================
 * ENUMS
 * ================================ */

export enum QueryType {
  TICKETS_BY_PLATE = 'tickets_by_plate',
  TICKETS_BY_DNI = 'tickets_by_dni',
  TICKETS_BY_RUC = 'tickets_by_ruc',
  INFRACTION_CODE = 'infraction_code',
  TAXES_BY_PLATE = 'taxes_by_plate',
  TAXES_BY_DNI = 'taxes_by_dni',
  TAXES_BY_RUC = 'taxes_by_ruc',
  TAXES_BY_TAXPAYER_CODE = 'taxes_by_taxpayer_code',
  CAPTURE_ORDER_BY_PLATE = 'capture_order_by_plate',
  PROCEDURE_BY_NUMBER = 'procedure_by_number',
}

// Mapeo estático entre tu enum y los nombres de la tabla consult_types
export const QueryTypeToConsultType: Record<QueryType, string> = {
  [QueryType.TICKETS_BY_PLATE]: 'Papeletas',
  [QueryType.TICKETS_BY_DNI]: 'Papeletas',
  [QueryType.TICKETS_BY_RUC]: 'Papeletas',
  [QueryType.INFRACTION_CODE]: 'Otras consultas',
  [QueryType.TAXES_BY_PLATE]: 'Vehicular',
  [QueryType.TAXES_BY_DNI]: 'Predial',
  [QueryType.TAXES_BY_RUC]: 'Predial',
  [QueryType.TAXES_BY_TAXPAYER_CODE]: 'Predial',
  [QueryType.CAPTURE_ORDER_BY_PLATE]: 'Procedimiento sancionador',
  [QueryType.PROCEDURE_BY_NUMBER]: 'Consulta trámite',
};

export enum DocumentType {
  PLATE = 'plate',
  DNI = 'dni',
  RUC = 'ruc',
  INFRACTION_CODE = 'infraction_code',
  TAXPAYER_CODE = 'taxpayer_code',
  PROCEDURE_NUMBER = 'procedure_number',
}


export type ChatStatus = 'pendiente' | 'prioridad' | 'completado';
export type MessageStatus = 'read' | 'unread';
export type Channels =
  | 'all'
  | 'telegram'
  | 'whatsapp'
  | 'instagram'
  | 'messenger'
  | 'email'
  | 'sms'
  | 'chatsat';
export type BotStatus = 'paused' | 'active' | 'out';
export type CitizenDocType = 'DNI' | 'CE' | 'OTROS';
export class ChannelChatDetail {
  channelRoomId: number;
  channel: Channels;
  attention: ChannelAttentionSummariesDTO;
  externalRoomId: string;
  botStatus: BotStatus;
  citizen: ChannelCitizen;
  agentAssigned?: ChannelAgent;
  messages: ChannelRoomMessage[];
}

export class ChannelUser {
  id?: number;
  externalUserId?: string;
  alias?: string;
  fullName?: string | null;
  documentNumber?: string | null;
  documentType?: CitizenDocType | null;
  avatar?: string;
  isAgent?: boolean;
  fromCitizen?: boolean;
  email?: string;
  phone?: string;
  lastSeen?: string;
  isActive?: boolean;
}

export class ChannelRoomMessage {
  id: number;
  channelRoomId?: number;
  content: string;
  attachments: Attachment[];
  status: MessageStatus;
  sender: ChannelUser;
  time: string;
  timestamp?: Date;
  externalMessageId?: string;
  fromMe?: boolean;
}

export class ChannelAgent {
  id: number;
  name: string;
  phoneNumber?: string;
  avatarUrl?: string;
  alias?: string;
  email?: string;
}
