import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SkillModule } from '@modules/skill/skill.module';
import { MailWorker } from './mail.worker';
import { SequelizeModule } from '@nestjs/sequelize';
import { MailAttention } from './entities/mail-attention.entity';
import { EstadoAtencionModule } from '@modules/estado-atencion/estado-atencion.module';
import { MailAttentionRepository } from './repositories/mail-attention.repository';
import { MailCenterService } from './services/mail-center.service';
import { MailCenterController } from './mail-center.controller';
import { MailFeaturesService } from './services/mail-features.service';
import { MailFeatureController } from './mail-feature.controller';
import { MailStateRepository } from './repositories/mail-state.repository';
import { MailState } from './entities/mail-state.entity';
import { MailCredentialRepository } from './repositories/mail-credential.repository';
import { MailCredential } from './entities/mail-credentials.entity';
import { MailAttachment } from './entities/mail-attachment.entity';
import { EstadoCanalModule } from '@modules/estado-canal/estado-canal.module';
import { GmailChannelService } from './services/gmail-channel.service';
import { MailAttachmentService } from './services/mail-attachment.service';
import { MailAttachmentRepository } from './repositories/mail-attachment.repository';
import { MailConfigurationController } from './mail-configuration.controller';
import { MailCredentialService } from './services/mail-credential.service';
import { InboxModule } from '@modules/inbox/inbox.module';
import { ChannelModule } from '@modules/channel/channel.module';
import { GmailListenService } from './services/gmail-listen.service';
import { MailWorkerService } from './services/mail-worker.service';
import { Mail } from './entities/mail.entity';
import { MailRepository } from './repositories/mail.repository';

@Module({
  imports: [EstadoAtencionModule,EstadoCanalModule,
    SequelizeModule.forFeature([MailAttention,Mail,MailState,MailCredential,MailAttachment]),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
     BullModule.registerQueue({
      name: 'mail-events',
    }),
    forwardRef(() => InboxModule),ChannelModule
  ],
  controllers: [MailCenterController,MailFeatureController,MailConfigurationController],
  providers: [MailWorker,MailAttentionRepository,MailRepository,
    MailCenterService,MailFeaturesService,MailStateRepository,MailCredentialRepository,GmailChannelService,
    MailAttachmentService,MailAttachmentRepository,MailCredentialService,GmailListenService,MailWorkerService
  ],
  exports: [MailCredentialRepository,MailAttentionRepository, MailFeaturesService],
})
export class GmailModule {}