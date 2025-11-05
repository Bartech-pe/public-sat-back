import { forwardRef, Module } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { InboxController } from './inbox.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Inbox } from './entities/inbox.entity';
import { InboxRepository } from './repositories/inbox.repository';
import { InboxUser } from './entities/inbox-user.entity';
import { InboxUserRepository } from './repositories/inbox-user.repository';
import { InboxCredential } from './entities/inbox-credentials';
import { InboxCredentialRepository } from './repositories/inbox-credential.repository';
import { ChannelModule } from '@modules/channel/channel.module';
import { Channel } from '@modules/channel/entities/channel.entity';
import { EstadoCanal } from '@modules/estado-canal/entities/estado-canal.entity';
import { EstadoCanalModule } from '@modules/estado-canal/estado-canal.module';
import { GmailModule } from '@modules/gmail/gmail.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Channel, Inbox, InboxUser, InboxCredential]),
    ChannelModule,EstadoCanalModule,forwardRef(() => GmailModule),
  ],
  controllers: [InboxController],
  providers: [InboxService, InboxRepository, InboxUserRepository, InboxCredentialRepository],
  exports: [InboxRepository, InboxUserRepository, InboxCredentialRepository],
})
export class InboxModule {}
