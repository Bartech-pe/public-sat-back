import { ValidationMessages as v } from '@common/messages/validation-messages';
import { IsBoolean } from 'class-validator';
import { CreateChannelAssistanceDto } from '@modules/assistances/channel-assistance/dto/create-channel-assistance.dto';

export class RegisteerDispoDto extends CreateChannelAssistanceDto {
  @IsBoolean({ message: v.isBoolean('pauseAgent') })
  pauseAgent: boolean;
}
