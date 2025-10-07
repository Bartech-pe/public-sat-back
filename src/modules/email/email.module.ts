import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SequelizeModule } from '@nestjs/sequelize';
import { EmailAttention } from './entities/email-attention.entity';
import { EmailThread } from './entities/email-thread.entity';
import { EmailAttentionRepository } from './repositories/email-attention.repository';
import { EmailThreadRepository } from './repositories/email-thread.repository';
import { EmailCenterService } from './services/email-center.service';
import { EmailStateRepository } from './repositories/email-state.repository';
import { EmailState } from './entities/email-state.entity';
import { EmailCredentialRepository } from './repositories/email-credential.repository';
import { EmailCredential } from './entities/email-credentials.entity';
import { EmailAttachment } from './entities/email-attachment.entity';
import { EmailAttachmentRepository } from './repositories/email-attachment.repository';
import { EmailCredentialService } from './services/email-credential.service';
import { InboxModule } from '@modules/inbox/inbox.module';
import { ChannelModule } from '@modules/channel/channel.module';
import { AssistanceStateModule } from '@modules/assistance-state/assistance-state.module';
import { ChannelStateModule } from '@modules/channel-state/channel-state.module';
import { EmailCenterController } from './controllers/email-center.controller';
import { EmailFeatureController } from './controllers/email-feature.controller';
import { EmailConfigurationController } from './controllers/email-configuration.controller';
import { EmailWorker } from './email.worker';
import { EmailFeaturesService } from './services/email-features.service';
import { EmailChannelService } from './services/email-channel.service';
import { EmailAttachmentService } from './services/email-attachment.service';
import { EmailWorkerService } from './services/email-worker.service';
import { EmailListenService } from './services/email-listen.service';
import { EmailGateway } from './email.gateway';
import { UserModule } from '@modules/user/user.module';
import { AuthModule } from '@modules/auth/auth.module';
import { EmailSignatureController } from './controllers/email-signature.controller';
import { EmailSignatureService } from './services/email-signature.service';
import { EmailSignature } from './entities/email-signature.entity';
import { EmailSignatureRepository } from './repositories/email-signature.repository';

@Module({
  imports: [
    AssistanceStateModule,
    ChannelStateModule,
    SequelizeModule.forFeature([
      EmailAttention,
      EmailThread,
      EmailState,
      EmailCredential,
      EmailAttachment,
      EmailSignature,
    ]),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'mail-events',
    }),
    forwardRef(() => InboxModule),
    ChannelModule,
    forwardRef(() => AuthModule),
    UserModule,
  ],
  controllers: [
    EmailCenterController,
    EmailFeatureController,
    EmailConfigurationController,
    EmailSignatureController,
  ],
  providers: [
    EmailWorker,
    EmailAttentionRepository,
    EmailThreadRepository,
    EmailCenterService,
    EmailFeaturesService,
    EmailStateRepository,
    EmailCredentialRepository,
    EmailChannelService,
    EmailAttachmentService,
    EmailAttachmentRepository,
    EmailCredentialService,
    EmailListenService,
    EmailWorkerService,
    EmailSignatureService,
    EmailSignatureRepository,
    EmailGateway,
  ],
  exports: [
    EmailWorker,
    EmailAttentionRepository,
    EmailThreadRepository,
    EmailCenterService,
    EmailFeaturesService,
    EmailStateRepository,
    EmailCredentialRepository,
    EmailChannelService,
    EmailAttachmentService,
    EmailAttachmentRepository,
    EmailCredentialService,
    EmailListenService,
    EmailWorkerService,
    EmailSignatureRepository,
  ],
})
export class EmailModule {}
