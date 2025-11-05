import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class ActiveChannel {
  channel: string;
  channelstate: string;
  channelstatedesc: string;
  calleridnum: string;
  calleridname: string;
  connectedlinenum: string;
  connectedlinename: string;
  language: string;
  accountcode: string;
  context: string;
  exten: string;
  priority: string;
  uniqueid: string;
  linkedid: string;
  application: string;
  applicationdata: string;
  duration: string;
  bridgeid: string;
}
export class ChannelData {
  exten: string;
  agent: ActiveChannel;
  client?: ActiveChannel | null;
}
export class ActualStateCall {
  constructor(state: string, style: string, icon: string) {
    this.state = state;
    this.style = style;
    this.icon = icon;
  }
  state: string;
  style: string;
  icon: string;
}
export class ActualCall {
  advisor: string;
  advisorCallId: string;
  phoneNumber: string;
  duration: number;
  actualState: ActualStateCall;
  channel: string;
  personal: boolean;
}
export class CallAMi {
  channel?: string;
  phoneNumber?: string;
  advisorName: string;
  agent: string;
  agentChannel: string;
  agentExtension: string;
  duration: number;
  actualState: ActualStateCall;
  personal: boolean;
  extension: string;
}
export const activeChannels: ActiveChannel[] = [
  {
    channel: 'SIP/1001-0000005e',
    channelstate: '6',
    channelstatedesc: 'Up',
    calleridnum: '0000000000',
    calleridname: 'S2508070954008600051',
    connectedlinenum: '0000000000',
    connectedlinename: 'S2508070954008600051',
    language: 'en',
    accountcode: '1001',
    context: 'default',
    exten: '8600051',
    priority: '1',
    uniqueid: '1754574841.457',
    linkedid: '1754574841.457',
    application: 'MeetMe',
    applicationdata: '8600051,F',
    duration: '00:03:30',
    bridgeid: '',
  },
  {
    channel: 'SIP/inmagna-0000005f',
    channelstate: '6',
    channelstatedesc: 'Up',
    calleridnum: '928086980',
    calleridname: 'Y8070855300000000060',
    connectedlinenum: '<unknown>',
    connectedlinename: '<unknown>',
    language: 'en',
    accountcode: '',
    context: 'default',
    exten: '8600051',
    priority: '1',
    uniqueid: '1754574928.459',
    linkedid: '1754574928.459',
    application: 'MeetMe',
    applicationdata: '8600051,F',
    duration: '00:02:04',
    bridgeid: '',
  },
];

export const StateIcon = (state: string) => {
  switch (state) {
    case 'Down':
    case 'Rsrvd':
    case 'NOT_INUSE':
      return new ActualStateCall(
        'Disponible',
        'text-green-600',
        'mdi:account-check',
      );
    case 'ONHOLD':
      return new ActualStateCall('En Pausa', 'text-yellow-600', 'mdi:pause');
    case 'Up':
      return new ActualStateCall('En Llamada', 'text-red-600', 'mdi:phone');
    case 'Busy':
      return new ActualStateCall('Ocupado', 'text-yellow-600', 'mdi:circle-on');
    case 'Unknown':
      return new ActualStateCall(
        'Fuera de Linea',
        'text-600',
        'mdi:account-cancel',
      );
    default:
      return new ActualStateCall(
        'Fuera de Linea',
        'text-600',
        'mdi:account-cancel',
      );
  }
};
export const getDurationCall = (now: Date, timestamp: string) => {
  const total = now.getTime() - new Date(timestamp).getTime();
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${minutes}:${seconds}`;
};
export const getDurationCallSeconds = (now: Date, timestamp: string) => {
  const total = now.getTime() - new Date(timestamp).getTime();
  return total / 1000;
};
export const durationToSeconds = (duration: string) => {
  const [hours, minutes, seconds] = duration.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

export class AMIFilter {
  @ApiProperty({
    description: 'limit',
    required: true,
    example: 10,
  })
  @IsNumber()
  limit: number;
  @ApiProperty({
    description: 'offset',
    required: true,
    example: 50,
  })
  @IsNumber()
  offset: number;
  @ApiProperty({
    description: 'state',
    required: false,
    example: 0,
  })
  @IsOptional()
  @IsString()
  state?: string;
  @ApiProperty({
    description: 'search',
    example: 'papeleta',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
  @ApiProperty({
    description: 'alert',
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  alert?: boolean;
}

export class AdvisorDTO {
  username: string;
  phoneLogin: string;
  user?: {
    displayName: string;
  };
}
