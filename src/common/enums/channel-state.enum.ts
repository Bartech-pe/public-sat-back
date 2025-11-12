export enum ChannelEnum {
  WHATSAPP = 2,
  EMAIL = 4,
  CHATSAT = 7,
}

export enum ChannelStateEnum {
  OFFLINE = 13,
}

export enum ChannelStateOffline {
  WHATSAPP = 5,
  CHATSAT = 9,
  EMAIL = 13,
}

export const OfflineEnumToChannel: Record<ChannelEnum, ChannelStateOffline> = {
  [ChannelEnum.WHATSAPP]: ChannelStateOffline.WHATSAPP,
  [ChannelEnum.CHATSAT]: ChannelStateOffline.CHATSAT,
  [ChannelEnum.EMAIL]: ChannelStateOffline.EMAIL,
};
