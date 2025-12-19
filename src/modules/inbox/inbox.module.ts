import { Module } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { InboxController } from './inbox.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Inbox } from './entities/inbox.entity';
import { InboxRepository } from './repositories/inbox.repository';
import { InboxUser } from './entities/inbox-user.entity';
import { InboxUserRepository } from './repositories/inbox-user.repository';
import { InboxCredential } from './entities/inbox-credential.entity';
import { InboxCredentialRepository } from './repositories/inbox-credential.repository';
import { ChannelModule } from '@modules/channel/channel.module';
import { Channel } from '@modules/channel/entities/channel.entity';
import { ChannelStateModule } from '@modules/custom-states/channel-state/channel-state.module';
import { InboxSchedule } from './entities/inbox-schedule.entity';
import { ChannelStateUserHistory } from './entities/channel-state-user-history.model';
import { ChannelStateUserHistoryRepository } from './repositories/channel-state-user-history.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Channel,
      Inbox,
      InboxUser,
      InboxCredential,
      InboxSchedule,
      ChannelStateUserHistory,
    ]),
    ChannelModule,
    ChannelStateModule,
  ],
  controllers: [InboxController],
  providers: [
    InboxService,
    InboxRepository,
    InboxUserRepository,
    InboxCredentialRepository,
    ChannelStateUserHistoryRepository,
  ],
  exports: [
    InboxService,
    InboxRepository,
    InboxUserRepository,
    InboxCredentialRepository,
    ChannelStateUserHistoryRepository,
  ],
})
export class InboxModule {}
