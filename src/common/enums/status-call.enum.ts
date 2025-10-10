export enum VicidialAgentStatus {
  READY = 'READY', // Disponible para recibir llamada
  QUEUE = 'QUEUE', // En cola esperando asignación de llamada
  INCALL = 'INCALL', // En llamada activa
  PAUSED = 'PAUSED', // En pausa (con pause_code)
  CLOSER = 'CLOSER', // En llamada de cierre o transferencia
  MQUEUE = 'MQUEUE', // En cola manual
}

export enum ChannelPhoneState {
  READY = 1,
  QUEUE = 19,
  INCALL = 17,
  PAUSED = 18,
  CLOSER = 15,
  OFFLINE = 16,
}
