export enum VicidialAgentStatus {
  READY = 'READY', // Disponible para recibir llamada
  QUEUE = 'QUEUE', // En cola esperando asignación de llamada
  INCALL = 'INCALL', // En llamada activa
  PAUSED = 'PAUSED', // En pausa (con pause_code)
  CLOSER = 'CLOSER', // En llamada de cierre o transferencia
  DISPO = 'DISPO', // En llamada de cierre o transferencia
}

export enum ChannelPhoneState {
  READY = 1,
  QUEUE = 19,
  INCALL = 17,
  PAUSED = 18,
  CLOSER = 1,
  DISPO = 15,
  OFFLINE = 16,
}

export const VicidialAgentStatusObj: Record<
  VicidialAgentStatus,
  ChannelPhoneState
> = {
  [VicidialAgentStatus.READY]: ChannelPhoneState.READY,
  [VicidialAgentStatus.QUEUE]: ChannelPhoneState.QUEUE,
  [VicidialAgentStatus.INCALL]: ChannelPhoneState.INCALL,
  [VicidialAgentStatus.PAUSED]: ChannelPhoneState.PAUSED,
  [VicidialAgentStatus.DISPO]: ChannelPhoneState.DISPO,
  [VicidialAgentStatus.CLOSER]: ChannelPhoneState.CLOSER,
};
