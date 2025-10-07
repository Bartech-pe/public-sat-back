import { forwardRef, Module } from '@nestjs/common';
import { MultiChannelChatService } from './multi-channel-chat.service';
import { UserModule } from '@modules/user/user.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '@modules/auth/auth.module';
import { ChannelRoom } from './entities/channel-room.entity';
import { ChannelCitizen } from './entities/channel-citizen.entity';
import { ChannelMessage } from './entities/channel-message.entity';
import { ChannelMessageRepository } from './repositories/channel-messages.repository';
import { ChannelRoomRepository } from './repositories/channel-room.repository';
import { ChannelCitizenRepository } from './repositories/channel-citizen.repository';
import { ChannelModule } from '@modules/channel/channel.module';
import { InboxModule } from '@modules/inbox/inbox.module';
import { ChannelRoomService } from './services/channel-room.service';
import { ChannelRoomController } from './controllers/channel-room.controller';
import { Channel } from '@modules/channel/entities/channel.entity';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { MultiChannelChatGateway } from './multi-channel-chat.gateway';
import { ChannelMessageController } from './controllers/channel-message.controller';
import { RasaService } from '@modules/call/rasa.service';
import { RasaProxy } from '@common/proxy/rasa/rasa.proxy';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisProvider } from './providers/redis.provider';
import { MessageBufferService } from './services/message-buffer.service';
import { BasicInfoService } from './services/basic-info.service';
import { ChannelAttention } from './entities/channel-attention.entity';
import { ChannelAttentionRepository } from './repositories/channel-attention.repository';
import { CitizenService } from './services/citizen.service';
import { ChannelAttentionService } from './services/channel-attention.service';
import { ChannelCitizenController } from './controllers/channel-citizen.controller';
import { ChannelAttentionController } from './controllers/channel-assistance.controller';
import { ChannelMessageAttachment } from './entities/channel-message-attachments.entity';
import { ChannelMessageAttachmentRepository } from './repositories/channel-message-attachments.repository';
import { EmailModule } from '@modules/email/email.module';
import { SurveyModule } from '@modules/survey/survey.module';
@Module({
  imports: [
    forwardRef(() => AuthModule),
    SequelizeModule.forFeature([
      Channel,
      Inbox,
      ChannelRoom,
      ChannelCitizen,
      ChannelMessage,
      ChannelAttention,
      ChannelMessageAttachment,
    ]),
    UserModule,
    InboxModule,
    ChannelModule,
    EmailModule,
    ScheduleModule.forRoot(),
    SurveyModule,
  ],
  controllers: [
    ChannelRoomController,
    ChannelMessageController,
    ChannelCitizenController,
    ChannelAttentionController,
  ],
  providers: [
    MultiChannelChatService,
    ChannelMessageRepository,
    ChannelMessageRepository,
    ChannelAttentionService,
    ChannelRoomRepository,
    ChannelRoomService,
    ChannelMessageAttachmentRepository,
    RedisProvider,
    ChannelCitizenRepository,
    ChannelAttentionRepository,
    CitizenService,
    MultiChannelChatGateway,
    BasicInfoService,
    MessageBufferService,
    RasaService,
    RasaProxy,
  ],
  exports: [
    MultiChannelChatService,
    ChannelAttentionRepository,
    ChannelMessageRepository,
    ChannelRoomRepository,
    ChannelCitizenRepository,
  ],
})
export class MultiChannelChatModule {}
