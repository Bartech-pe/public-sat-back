import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ChannelCitizen } from '@modules/multi-channel-chat/entities/channel-citizen.entity';

export const CurrentCitizen = createParamDecorator(
  (_data: unknown, context: ExecutionContext): ChannelCitizen | undefined => {
    const request = context.switchToHttp().getRequest();
    const citizen = request.citizen;
    return citizen ? citizen.toJSON() : undefined;
  },
);
