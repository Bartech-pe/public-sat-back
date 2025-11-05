import { Module } from '@nestjs/common';
import { MultiChannelChatService } from './multi-channel-chat.service';
import { MultiChannelChatController } from './multi-channel-chat.controller';
import { UserModule } from '@modules/user/user.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '@modules/auth/auth.module';
import { ChannelRoom } from './entities/channel-room.entity';
import { Citizen } from './entities/citizen.entity';
import { ChannelMessage } from './entities/channel-message.entity';
import { ChannelMessageRepository } from './repositories/channel-messages.repository';
import { ChannelRoomRepository } from './repositories/channel-room.repository';
import { CitizenRepository } from './repositories/citizen.repository';
import { ChannelModule } from '@modules/channel/channel.module';
import { InboxModule } from '@modules/inbox/inbox.module';
import { ChannelRoomService } from './services/channel-room.service';
import { ChannelRoomController } from './controllers/channel-room.controller';
import { Channel } from '@modules/channel/entities/channel.entity';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { MultiChannelChatGateway } from './multi-channel-chat.gateway';
import { ConfigService } from '@nestjs/config';
import { ChannelMessageController } from './controllers/channel-message.controller';
import { RasaService } from '@modules/call/rasa.service';
import { RasaProxy } from '@common/proxy/rasa/rasa.proxy';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisProvider } from './providers/redis.provider';
import { MessageBufferService } from './services/message-buffer.service';
import { BasicInfoService } from './services/basic-info.service';
import { Assistance } from './entities/assistance.entity';
import { AssistanceRepository } from './repositories/assistance.repository';
import { CitizenService } from './services/citizen.service';
import { AssistanceService } from './services/assistance.service';
import { CitizenController } from './controllers/citizen.controller';
import { ChannelAssistanceController } from './controllers/channel-assistance.controller';
import { ChannelMessageAttachment } from './entities/channel-message-attachments.entity';
import { ChannelMessageAttachmentRepository } from './repositories/channel-message-attachments.repository';
import { MailFeaturesService } from '@modules/gmail/services/mail-features.service';
import { GmailModule } from '@modules/gmail/gmail.module';
@Module({
  imports: [
    AuthModule,
    SequelizeModule.forFeature([Channel, Inbox, ChannelRoom, Citizen, ChannelMessage, Assistance, ChannelMessageAttachment]),
    UserModule,
    InboxModule,
    ChannelModule,
    GmailModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [MultiChannelChatController, ChannelRoomController, ChannelMessageController, CitizenController, ChannelAssistanceController],
  providers: [
    MultiChannelChatService,
    ChannelMessageRepository,
    ChannelMessageRepository,
    AssistanceService,
    ChannelRoomRepository,
    ChannelRoomService,
    ChannelMessageAttachmentRepository,
    RedisProvider,
    CitizenRepository,
    AssistanceRepository,
    CitizenService,
    MultiChannelChatGateway,
    BasicInfoService,
    MessageBufferService,
    RasaService,
    RasaProxy
  ],
  exports: [
    MultiChannelChatService,
    AssistanceRepository,
    ChannelMessageRepository,
    ChannelRoomRepository,
    CitizenRepository
  ],
})
export class MultiChannelChatModule {}
