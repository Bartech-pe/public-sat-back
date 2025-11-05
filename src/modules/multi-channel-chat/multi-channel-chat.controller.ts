import { Controller, Get, Param } from '@nestjs/common';
import { ChannelRoom } from './entities/channel-room.entity';
import { MultiChannelChatService } from './multi-channel-chat.service';

@Controller('multi-channel-chat')
export class MultiChannelChatController {
      constructor(private readonly service: MultiChannelChatService) {}

    //   @Get('chatcanal/:idRoom')
    //   findOne(@Param('idRoom') idRoom: number): Promise<ChannelRoom> {
    //       return this.service.findOne(+idRoom);
    //   }
}
