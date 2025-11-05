import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { DatabaseCrmModule } from './database/crm/database-crm.module';
import { ConfigModule } from '@nestjs/config';
import { RoleModule } from './modules/role/role.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { TeamModule } from './modules/team/team.module';
import { CampaingModule } from './modules/campaing/campaing.module';
import { PredefinedResponseModule } from './modules/predefined-response/predefined-response.module';
import { ScreenModule } from './modules/screen/screen.module';
import { SkillModule } from './modules/skill/skill.module';
import { ChatRoomModule } from './modules/chat-room/chat-room.module';
import { InboxModule } from '@modules/inbox/inbox.module';
import { ChannelModule } from '@modules/channel/channel.module';
import { TagsModule } from './modules/tags/tags.module';
import { ReminderModule } from './modules/reminder/reminder.module';
import { CallModule } from '@modules/call/call.module';
import { QuickResponseModule } from '@modules/quickResponse/quickResponse.module';
import { CarterasModule } from '@modules/carteras/carteras.module';
// import { DetalleCarterasModule } from '@modules/detalle-carteras/detalle-carteras.module';
import { EstadoCampaniaModule } from './modules/estado-campania/estado-campania.module';
import { EstadoAtencionModule } from './modules/estado-atencion/estado-atencion.module';
import { EstadoCanalModule } from './modules/estado-canal/estado-canal.module';
import { AsignarCarteraModule } from '@modules/asignar-cartera/asignar-cartera.module';
import { TipoCampaniaModule } from '@modules/tipo-campania/tipo-campania.module';
import { AreaCampaniaModule } from '@modules/area-campania/area-campania.module';
import { GestionCampaniaModule } from '@modules/gestion-campania/gestion-campania.module';
import { MensajeAutomaticoModule } from '@modules/mensaje-automatico/mensaje-automatico.module';
import { SocketGateway } from './socket/socket.gateway';
import { MultiChannelChatModule } from './modules/multi-channel-chat/multi-channel-chat.module';
import { AreaModule } from './modules/area/area.module';
import { OficinaModule } from './modules/oficina/oficina.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from '@common/guards/jwt.guard';
import { RequestContextInterceptor } from '@common/interceptors/request-context.interceptor';
import { CarteraDetalleModule } from './modules/cartera-detalle/cartera-detalle.module';
import { AtencionCiudadanoModule } from './modules/atencion-ciudadano/atencion-ciudadano.module';
import { VicidialApiModule } from './modules/vicidial-api/vicidial-api.module';
import { CentralTelefonicaModule } from './modules/central-telefonica/central-telefonica.module';
import { DatabaseCentralModule } from '@database/central/database-central.module';
import { AppController } from './app.controller';
import { OmnicanalidadModule } from './api-sat/omnicanalidad/omnicanalidad.module';
import { SaldomaticoModule } from './api-sat/saldomatico/saldomatico.module';
import { AuthSatModule } from './api-sat/auth-sat/auth-sat.module';
import { FeriadoModule } from '@modules/horario/feriado.module';
import { ScheduleModule } from '@nestjs/schedule';
import { GmailModule } from '@modules/gmail/gmail.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { SocketModule } from './socket/socket.module';
import { ScheduleAssignmentModule } from './modules/schedule-assignment/schedule-assignment.module';
import { MonitorModule } from '@modules/monitor/monitor.module';
import { SurveyModule } from '@modules/survey/survey.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    DatabaseCentralModule,
    DatabaseCrmModule,
    AuthModule,
    RoleModule,
    UserModule,
    TeamModule,
    CampaingModule,
    PredefinedResponseModule,
    ScreenModule,
    ChannelModule,
    InboxModule,
    SkillModule,
    ChatRoomModule,
    TagsModule,
    ReminderModule,
    CallModule,
    QuickResponseModule,
    CarterasModule,
    EstadoCampaniaModule,
    EstadoAtencionModule,
    AsignarCarteraModule,
    TipoCampaniaModule,
    AreaCampaniaModule,
    GestionCampaniaModule,
    MensajeAutomaticoModule,
    EstadoCanalModule,
    MultiChannelChatModule,
    AreaModule,
    OficinaModule,
    CarteraDetalleModule,
    AtencionCiudadanoModule,
    VicidialApiModule,
    CentralTelefonicaModule,
    OmnicanalidadModule,
    SaldomaticoModule,
    AuthSatModule,
    FeriadoModule,
    GmailModule,
    NotificationModule,
    SocketModule,
    ScheduleAssignmentModule,
    MonitorModule,
    SurveyModule
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
