import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SocketGateway } from './socket/socket.gateway';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { RequestContextInterceptor } from '@common/interceptors/request-context.interceptor';
import { DatabaseModule } from '@database/database.module';
import { AuthModule } from '@modules/auth/auth.module';
import { RoleModule } from '@modules/role/role.module';
import { UserModule } from '@modules/user/user.module';
import { DepartmentModule } from '@modules/department/department.module';
import { OfficeModule } from '@modules/office/office.module';
import { VicidialModule } from './modules/vicidial/vicidial.module';
import { ApiSatModule } from '@modules/api-sat/api-sat.module';
import { TeamModule } from '@modules/team/team.module';
import { CampaignModule } from '@modules/campaign/campaign.module';
import { CampaignStateModule } from '@modules/campaign-state/campaign-state.module';
import { CampaignTypeModule } from '@modules/campaign-type/campaign-type.module';
import { ScreenModule } from '@modules/screen/screen.module';
import { SkillModule } from '@modules/skill/skill.module';
import { TagModule } from '@modules/tag/tag.module';
import { PredefinedResponseModule } from '@modules/predefined-response/predefined-response.module';
import { ChannelModule } from '@modules/channel/channel.module';
import { ChannelStateModule } from '@modules/channel-state/channel-state.module';
import { InboxModule } from '@modules/inbox/inbox.module';
import { ChatRoomModule } from '@modules/chat-room/chat-room.module';
import { ReminderModule } from '@modules/reminder/reminder.module';
import { QuickResponseModule } from '@modules/quick-response/quick-response.module';
import { PortfolioModule } from '@modules/portfolio/portfolio.module';
import { PortfolioDetailModule } from '@modules/portfolio-detail/portfolio-detail.module';
import { MultiChannelChatModule } from '@modules/multi-channel-chat/multi-channel-chat.module';
import { AutomaticMessageModule } from '@modules/automatic-message/automatic-message.module';
import { CitizenAssistanceModule } from '@modules/citizen-assistance/citizen-assistance.module';
import { ScheduleModule } from '@modules/schedule/schedule.module';
import { SmsModule } from '@modules/sms/sms.module';
import { AssistanceStateModule } from '@modules/assistance-state/assistance-state.module';
import { CallModule } from '@modules/call/call.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { EmailModule } from '@modules/email/email.module';
import { ChannelScheduleModule } from '@modules/channel-schedule/channel-schedule.module';
import { SurveyModule } from '@modules/survey/survey.module';
import { CitizenModule } from '@modules/citizen/citizen.module';
import { ConsultTypeModule } from '@modules/consult-type/consult-type.module';
import { ChannelAssistanceModule } from '@modules/channel-assistance/channel-assistance.module';
import { TemplateEmailModule } from './modules/template-email/template-email.module';
import { CampaignEmailModule } from './modules/campaign-email/campaign-email.module';
import { CampaingEmailConfigModule } from './modules/campaing-email-config/campaing-email-config.module';
import { MetabaseModule } from './modules/metabase/metabase.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'), 
      serveRoot: '/uploads', 
    }),
    DatabaseModule,
    AuthModule,
    RoleModule,
    UserModule,
    DepartmentModule,
    OfficeModule,
    TeamModule,
    SkillModule,
    TagModule,
    ScreenModule,
    CampaignTypeModule,
    CampaignStateModule,
    CampaignModule,
    ChannelStateModule,
    ChannelModule,
    ConsultTypeModule,
    CitizenModule,
    InboxModule,
    ChatRoomModule,
    PortfolioModule,
    PortfolioDetailModule,
    CitizenAssistanceModule,
    AssistanceStateModule,
    ChannelAssistanceModule,
    PredefinedResponseModule,
    QuickResponseModule,
    ReminderModule,
    MultiChannelChatModule,
    AutomaticMessageModule,
    ScheduleModule,
    CallModule,
    SmsModule,
    EmailModule,
    NotificationModule,
    ChannelScheduleModule,
    SurveyModule,

    // Modulos externos
    VicidialModule,
    ApiSatModule,
    TemplateEmailModule,
    CampaignEmailModule,
    CampaingEmailConfigModule,
    MetabaseModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
    SocketGateway,
  ],
  // controllers: [AppController],
})
export class AppModule {}
