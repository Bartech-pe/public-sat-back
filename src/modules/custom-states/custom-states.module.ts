import { Module } from '@nestjs/common';
import { AssistanceStateModule } from './assistance-state/assistance-state.module';
import { CampaignStateModule } from './campaign-state/campaign-state.module';
import { ChannelStateModule } from './channel-state/channel-state.module';

@Module({
  imports: [AssistanceStateModule, CampaignStateModule, ChannelStateModule],
})
export class CustomStatesModule {}
