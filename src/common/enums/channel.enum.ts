export enum ChannelEnum {
  TELEGRAM = 1,
  WHATSAPP = 2,
  SMS = 3,
  EMAIL = 4,
  INSTAGRAM = 5,
  MESSENGER = 6,
  CHATSAT = 7,
  VICIDIAL = 8,
}


export enum AvailableEnum {
  CHATSAT_AVAILABLE = 3,
  WHATSAPP_AVAILABLE = 4,
  TELEGRAM_AVAILABLE = 21
}

export enum UnavailableEnum {
  WHATSAPP_UNAVAILABLE = 5,
  CHATSAT_UNAVAILABLE = 9,
  TELEGRAM_UNAVAILABLE = 20
}

export enum CateroryEnum {
  WHATSAPP = 2,
  CHATSAT = 7,
  TELEGRAM = 1
}
export const AvailableEnumToCategory: Record<CateroryEnum, AvailableEnum> = {
  [CateroryEnum.WHATSAPP]: AvailableEnum.WHATSAPP_AVAILABLE,
  [CateroryEnum.CHATSAT]: AvailableEnum.CHATSAT_AVAILABLE,
  [CateroryEnum.TELEGRAM]: AvailableEnum.CHATSAT_AVAILABLE,
};

export const UnavailableEnumToCategory: Record<CateroryEnum, UnavailableEnum> = {
  [CateroryEnum.WHATSAPP]: UnavailableEnum.WHATSAPP_UNAVAILABLE,
  [CateroryEnum.CHATSAT]: UnavailableEnum.CHATSAT_UNAVAILABLE,
  [CateroryEnum.TELEGRAM]: UnavailableEnum.TELEGRAM_UNAVAILABLE,
};