import { ChannelEnum } from './channel.enum';

export enum CategoryChannelEnum {
  PHONE = 1,
  MAIL = 2,
  CHATSAT = 3,
  WHATSAPP = 4,
}

export const CategoryChannelEnumToChannelEnum: Record<
  CategoryChannelEnum,
  ChannelEnum
> = {
  [CategoryChannelEnum.PHONE]: ChannelEnum.VICIDIAL,
  [CategoryChannelEnum.MAIL]: ChannelEnum.EMAIL,
  [CategoryChannelEnum.CHATSAT]: ChannelEnum.CHATSAT,
  [CategoryChannelEnum.WHATSAPP]: ChannelEnum.WHATSAPP,
};
