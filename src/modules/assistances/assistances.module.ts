import { Module } from '@nestjs/common';
import { CitizenAssistanceModule } from '@modules/assistances/citizen-assistance/citizen-assistance.module';
import { ChannelAssistanceModule } from '@modules/assistances/channel-assistance/channel-assistance.module';
import { GenericAssistanceModule } from './generic_assistance/generic_assistance.module';

@Module({
  imports: [
    CitizenAssistanceModule,
    ChannelAssistanceModule,
    GenericAssistanceModule,
  ],
})
export class AssistancesModule {}
