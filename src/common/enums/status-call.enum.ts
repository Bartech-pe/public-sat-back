export enum VicidialAgentStatus {
  READY = 'READY', // Disponible para recibir llamada
  QUEUE = 'QUEUE', // En cola esperando asignación de llamada
  INCALL = 'INCALL', // En llamada activa
  PAUSED = 'PAUSED', // En pausa (con pause_code)
  CLOSER = 'CLOSER', // En llamada de cierre o transferencia
  MQUEUE = 'MQUEUE', // En cola manual
}
