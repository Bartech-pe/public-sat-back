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
import { ChannelStateModule } from '@modules/channel-state/channel-state.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Channel, Inbox, InboxUser, InboxCredential]),
    ChannelModule,
    ChannelStateModule
  ],
  controllers: [InboxController],
  providers: [InboxService, InboxRepository, InboxUserRepository, InboxCredentialRepository],
  exports: [InboxRepository, InboxUserRepository, InboxCredentialRepository],
})
export class InboxModule {}
