import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import {
  ActiveChannel,
  AMIFilter,
  CallAMi,
  durationToSeconds,
  StateIcon,
} from './dto/ami.dto';
import {
  DataCollection,
  GetPages,
} from '@common/interfaces/paginated-response.interface';
import { formatPhoneNumber, stripPeruCode } from '@common/helpers/phone.helper';
import { groupBy } from '@common/helpers/group.helper';
import { AMIGateway } from './ami.gateway';
import { RequestContextService } from '@common/context/request-context.service';
import { VicidialUserRepository } from '@modules/user/repositories/vicidial-user.repository';
import { User } from '@modules/user/entities/user.entity';
import { AloSatService } from '@modules/vicidial/central-telefonica/services/alo-sat.service';
import { CallService } from '@modules/call/services/call.service';
import { CallDTO, InterferCallDTO } from '@modules/call/dto/call.dto';
import { SpyDTO } from '@modules/call/dto/spy.dto';
import { RecordingDTO } from '@modules/call/dto/recording-dto';
import { amiConfig } from 'config/env';
import {
  ChannelPhoneState,
  VicidialAgentStatus,
} from '@common/enums/status-call.enum';
import { VicidialPauseCode } from '@common/enums/pause-code.enum';
import { UserGateway } from '@modules/user/user.gateway';
import { CallHistoryRepository } from '@modules/call/repositories/call-history.repository';
const AsteriskManager = require('asterisk-manager');

@Injectable()
export class AmiService implements OnModuleInit {
  private ami: any;
  private canales: ActiveChannel[] = [];
  private channelAdvisors: CallAMi[] = [];
  private actives: CallAMi[] = [];

  constructor(
    private readonly callService: CallService,
    private readonly gateway: AMIGateway,
    private readonly userRepository: VicidialUserRepository,
    @Inject(forwardRef(() => AloSatService))
    private readonly aloSatService: AloSatService,
    private readonly vicidialUserRepository: VicidialUserRepository,
    private readonly callHistoryRepository: CallHistoryRepository,
    @Inject(forwardRef(() => UserGateway))
    private readonly userGateway: UserGateway,
  ) {
    try {
      const port = amiConfig.port;
      const host = amiConfig.host;
      const user = amiConfig.user;
      const pass = amiConfig.pass;
      // console.log('🛠️ Conectando al AMI con:', { host, port, user });

      this.ami = AsteriskManager(port, host, user, pass, true);
      this.ami.keepConnected();
      // console.log('📦 Inicializando módulo AMI...');
      this.ami.on('connect', () => {
        // console.log('Conectado al AMI');
      });
      this.ami.on('error', (err) => {
        // console.error('Error en AMI:', err);
      });
      this.ami.on('managerevent', async (event) => {
        // console.log('📥 Evento AMI recibido (Manager):', event);
        switch (event.event) {
          case 'PeerStatus':
            //console.log(`PeerStatus:`, event);
            break;
          case 'ExtensionStatus':
            console.log(`ExtensionStatus:`, event);
            break;
          case 'DeviceStateChange':
            this.DeviceStatus(event);
            break;
          case 'Newchannel':
            // this.NewChannel(event);
            // if (
            //   /^SIP\/[^-]+-\w+$/.test(event.channel) &&
            //   event.channelstate == '4' &&
            //   event.channelstatedesc == 'Ring'
            // ) {
            //   console.log('Newchannel', event);
            //   await this.callHistoryRepository.create({
            //     uniqueId: event.uniqueid,
            //     userCode: event.exten,
            //     phoneNumber: stripPeruCode(event.calleridnum),
            //     channel: event.channel,
            //     entryDate: new Date(),
            //     callStatus: VicidialAgentStatus.QUEUE,
            //   });
            // }

            break;
          case 'BridgeInfoChannel':
            //console.log(`BridgeInfoChannel:`, event);
            break;
          case 'BridgeListComplete':
            // console.log(`BridgeListComplete:`, event);
            break;
          case 'Newstate':
            if (
              event.channelstate === '4' &&
              /^SIP\/[^-]+-\w+$/.test(event.channel) &&
              event.context != 'default'
            ) {
              console.log('Llamada entrante detectada:', event);

              await this.callHistoryRepository.create({
                uniqueId: event.uniqueid,
                userCode: event.exten,
                phoneNumber: stripPeruCode(event.calleridnum),
                channel: event.channel,
                entryDate: new Date(),
                callStatus: VicidialAgentStatus.QUEUE,
              });

              // const viciUsers = await this.vicidialUserRepository.findAll({
              //   raw: true,
              //   where: { channelStateId: ChannelPhoneState.READY },
              // });

              // for (const v of viciUsers) {
              //   console.log(`Reanudando agente: ${v.username}`);
              //   await aloSatService.resumeAgent(v.userId);
              // }
            }
            break;
          case 'MeetmeJoin':
            if (/^SIP\/[^-]+-\w+$/.test(event.channel)) {
              // console.log(`MeetmeJoin:`, event);
              console.log(`meetme:`, event.meetme);
              // const username = await aloSatService.getAgentNameByConfExten(
              //   event.meetme,
              // );
              // if (username) {
              //   // console.log(`username:`, username);
              //   // const vicidialUser = await this.vicidialUserRepository.findOne({
              //   //   where: {
              //   //     username: username,
              //   //     channelStateId: ChannelPhoneState.READY,
              //   //   },
              //   // });

              //   // if (vicidialUser) {
              //   //   await vicidialUser?.update({
              //   //     channelStateId: ChannelPhoneState.INCALL,
              //   //     pauseCode: null,
              //   //   });
              //   //   this.userGateway.notifyPhoneStateUser(
              //   //     vicidialUser.toJSON().userId,
              //   //   );
              //   // }
              // }
            }
            break;
          case 'MeetmeLeave':
            console.log(`MeetmeLeave:`, event);
            if (
              /^SIP\/[^-]+-\w+$/.test(event.channel) &&
              event.exten !== '8301'
            ) {
              const username = await aloSatService.getAgentNameByConfExten(
                event.meetme,
              );
              if (username) {
                const vicidialUser = await this.vicidialUserRepository.findOne({
                  where: {
                    username: username,
                    channelStateId: ChannelPhoneState.INCALL,
                  },
                });

                if (vicidialUser) {
                  // await this.aloSatService.onChangeIngroups(
                  //   vicidialUser?.toJSON()?.userId,
                  // );
                  // await new Promise((res) => setTimeout(res, 300));
                  await this.aloSatService.endCall(
                    vicidialUser?.toJSON()?.userId,
                  );

                  const lastCall = await this.callHistoryRepository.getLastCall(
                    vicidialUser?.toJSON()?.userId,
                  );

                  if (lastCall) {
                    const finalStatus =
                      await this.aloSatService.getFinalStatusByLeadId(
                        lastCall.toJSON().leadId,
                      );
                    await lastCall.update({
                      seconds: !Number.isNaN(event.duration)
                        ? Number(event.duration)
                        : (new Date().getTime() -
                            new Date(lastCall.toJSON().entryDate).getTime()) /
                          1000,
                      callStatus:
                        finalStatus != VicidialAgentStatus.QUEUE
                          ? finalStatus
                          : 'DROP',
                    });
                  }

                  // await vicidialUser?.update({
                  //   channelStateId: ChannelPhoneState.PAUSED,
                  //   pauseCode: VicidialPauseCode.WRAP,
                  // });
                  // this.userGateway.notifyPhoneStateUser(
                  //   vicidialUser.toJSON().userId,
                  // );
                }
              }
            }
            break;
          case 'Hangup':
            console.log('Hangup:', event);

            // Detectar si la llamada pertenece a una entrante en cola
            if (/^SIP\/[^-]+-\w+$/.test(event.channel)) {
              const lastCall = await this.callHistoryRepository.findOne({
                where: { uniqueId: event.uniqueid },
                order: [['entryDate', 'DESC']],
              });
              if (lastCall) {
                const callData = lastCall.toJSON();
                // Solo si sigue en cola (nunca pasó a INCALL)
                if (callData.callStatus === VicidialAgentStatus.QUEUE) {
                  await lastCall.update({
                    seconds:
                      (new Date().getTime() -
                        new Date(callData.entryDate).getTime()) /
                      1000,
                    callStatus: 'DROP',
                  });
                  console.log(
                    `Llamada abandonada detectada: ${callData.phoneNumber}, actualizada a 'DROP'`,
                  );
                }
              }
            }

            break;
          case 'CoreShowChannel':
            if (
              event.exten.length > 2 &&
              event.channelstatedesc != 'Ring' &&
              /^SIP\/[^-]+-\w+$/.test(event.channel)
            ) {
              this.canales.push(event as ActiveChannel);
            }
            break;
          case 'CoreShowChannelsComplete':
            console.log(`canales actuales:`, this.canales);
            this.canales = [];
            this.channelAdvisors = [];
            break;
          case 'RTCPSent':
            break;
          case 'RTCPReceived':
            break;
          default:
            //console.log(`Random:`,event);
            break;
        }
      });
    } catch (error) {
      console.error('Error al crear instancia de AsteriskManager:', error);
      throw new Error('No se pudo conectar a Asterisk');
    }
  }

  onModuleInit() {}

  private PeerStatus() {
    this.ami.on('PeerStatus', (event) => {
      // console.log(`PeerStatus: ${event}`);
    });
  }

  private ExtensionStatus() {
    this.ami.on('ExtensionStatus', (event) => {
      // console.log(`ExtensionStatus: ${event}`);
      const sip = event.device.split('/')[1];
      const channaelDevice = this.actives.find((canal) => canal.agent === sip);
      if (channaelDevice) {
        channaelDevice.actualState = StateIcon(event.state);
      }
    });
  }

  private DeviceStatus(event: any) {
    //console.log(`DeviceStatus:`,event);
    const sip = event.device.split('/')[1];
    const channaelDevice = this.actives.find((canal) => canal.agent === sip);
    if (channaelDevice) {
      channaelDevice.actualState = StateIcon(event.state);
      this.RunGetCoreChannelAction();
    }
  }

  private async NewChannel(event: any) {
    // console.log(`Newchannel:`, event);
    this.RunGetCoreChannelAction();
    /*if(event.accountcode.length>0){
        let nombre='asesor no encontrado'
        const exist = await this.callService.getAdvisorByPhoneLogin(event.accountcode);
        if(exist){
          nombre = exist.displayName
        }

        const accept:CallAMi={
          advisorName: nombre,
          agent: event.accountcode,
          agentChannel: event.channel,
          duration: 0,
          actualState: StateIcon(event.channelstatedesc),
          personal: false,
          extension: event.exten
        }
        this.actives.push(accept)
        console.log('canal nuevo insertado',this.actives)
    }*/
  }

  private HangUp() {
    this.ami.on('Hangup', (event) => {
      // console.log(`Hangup: ${event}`);
    });
  }

  RunGetCoreChannelAction() {
    this.ami.action({ Action: 'CoreShowChannels' }, (err, res) => {
      if (err) {
        console.error('Error al enviar acción CoreShowChannels:', err);
      } else {
        // console.log('Acción CoreShowChannels enviada correctamente.', res);
      }
    });
  }

  async GetCoreChannel(body: AMIFilter) {
    let elements: CallAMi[] = [];
    const advisors = await this.callService.GetAdvisorsInfo();
    for (const item of advisors) {
      const exist = this.actives.find((ch) => ch.agent === item.phonelogin);
      const element: CallAMi = {
        advisorName: item.displayName,
        agent: item.phonelogin,
        agentChannel: exist ? exist.agentChannel : '',
        duration: exist ? exist.duration : 0,
        phoneNumber: exist ? exist.phoneNumber : '',
        actualState: exist ? exist.actualState : StateIcon('Unknown'),
        personal: exist ? exist.personal : false,
        extension: exist ? exist.extension : '',
        channel: exist ? exist.channel : '',
        agentExtension: exist ? exist.agentExtension : '',
      };
      elements.push(element);
    }
    if (body.state) {
      elements = elements.filter((ch) => ch.actualState.state == body.state);
    }
    if (body.search) {
      elements = elements.filter((ch) =>
        ch.advisorName.includes(body.search?.toString() ?? ''),
      );
    }
    if (body.alert == true) {
      elements = elements.filter((ch) => ch.actualState.state == 'En Llamada');
    }
    const total = elements.length;
    const resolveArr = elements.slice(body.offset, body.offset + body.limit);
    const response: DataCollection<CallAMi> = {
      items: resolveArr,
      total: total,
      page: Math.floor(body.offset / body.limit) + 1,
      pages: GetPages(body.limit, total),
    };
    return response;
  }

  async callStart(body: CallDTO) {
    // console.log('body', body);

    return new Promise((resolve, reject) => {
      this.ami.action(
        {
          Action: 'Originate',
          Channel: `SIP/${body.agent}`,
          //Context: 'from-internal',
          Application: 'Dial',
          Data: `SIP/${body.client},30`,
          //Exten: body.client,
          Priority: 1,
          CallerID: `Agente-${body.agent}`,
          Async: true,
        },
        (err, res) => (err ? reject(err) : resolve(res)),
      );
    });
  }

  async GetAdminChannel() {
    const fullUser = RequestContextService.get<any>('user');
    const vicidial = await this.userRepository.findAll({
      attributes: ['username', 'phoneLogin'],
      where: { userId: fullUser.id },
    });
    if (!vicidial) {
      throw new NotFoundException(`vicidial no encontrado`);
    }
    const vicidialJson = vicidial.map((a) => a.toJSON());
    const active = this.actives.find(
      (item) => item.agent == vicidialJson[0].phoneLogin,
    );
    if (!active) {
      throw new NotFoundException(`agente inactivo`);
    }
    return active;
  }

  async InterferCall(body: InterferCallDTO) {
    const fullUser = RequestContextService.get<any>('user');
    const vicidial = await this.userRepository.findAll({
      attributes: ['username', 'phoneLogin'], //1001
      where: { userId: fullUser.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id'],
        },
      ],
    });
    const vicidialJson = vicidial.map((a) => a.toJSON());
    const replace = this.actives.find((item) => item.agent == body.agent);
    if (!replace?.extension) {
      throw new NotFoundException('Agent extension not found for transfer');
    }
    const replaceAgent = await this.userRepository.findAll({
      attributes: ['username', 'phoneLogin'], //1001
      where: { phoneLogin: replace?.agent },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id'],
        },
      ],
    });
    const replaceAgentJson = replaceAgent.map((a) => a.toJSON());
    await this.aloSatService.transferCall(
      replaceAgentJson[0].id,
      vicidialJson[0].id,
    );
  }

  async callEnd(canal: string) {
    return new Promise((resolve, reject) => {
      this.ami.action(
        {
          Action: 'Hangup',
          Channel: canal,
        },
        (err, res) => (err ? reject(err) : resolve(res)),
      );
    });
  }

  async spyCall(body: SpyDTO) {
    const active = await this.GetAdminChannel();
    let volume = '';
    if (typeof body.volume === 'number' && body.volume !== 50) {
      const diff = Math.abs(body.volume - 50);
      const steps = Math.min(Math.floor(diff / 10), 4);
      if (body.volume > 50) {
        volume = 'V'.repeat(steps);
      } else if (body.volume < 50) {
        volume = 'v'.repeat(steps);
      }
    }
    return new Promise((resolve, reject) => {
      this.ami.action(
        {
          Action: 'Originate',
          Channel: `SIP/${active.agent}`,
          Application: 'ChanSpy',
          Data: `${body.destiny},q${volume}`,
          CallerID: `Supervisor <${active.agent}>`,
          Async: true,
        },
        (err, res) => (err ? reject(err) : resolve(res)),
      );
    });
  }

  async enterCall(body: SpyDTO) {
    const active = await this.GetAdminChannel();
    return new Promise((resolve, reject) => {
      this.ami.action(
        {
          Action: 'Originate',
          Channel: `SIP/${active.agent}`,
          Application: 'ChanSpy',
          Data: `${body.destiny}`,
          CallerID: `Supervisor <${active.agent}>`,
          Async: true,
        },
        (err, res) => (err ? reject(err) : resolve(res)),
      );
    });
  }

  async recording(body: RecordingDTO) {
    const archivo = `/var/recordings/${body.agent}_${Date.now()}.wav`;
    return new Promise((resolve, reject) => {
      this.ami.action(
        {
          Action: 'Command',
          Command: `mixmonitor start ${body.channel} ${archivo} b`,
        },
        async (err, res) => {
          if (err) {
            console.error('Error al iniciar grabación:', err);
            return reject(err);
          }
          console.log('Grabación iniciada:', res);
          resolve({ file: archivo, channel: body.channel });
        },
      );
    });
  }

  async stopRecording(canal: string) {
    return new Promise((resolve, reject) => {
      this.ami.action(
        {
          Action: 'Command',
          Command: `mixmonitor stop ${canal}`,
        },
        async (err, res) => {
          if (err) {
            console.error('Error al iniciar grabación:', err);
            return reject(err);
          }
          console.log('Grabación finalizada:', res);
          resolve({ res });
        },
      );
    });
  }

  /*async downloadRecordingFromAsterisk(filename: string): Promise<string> {
    const sftp = new Client();
    const remotePath = `/var/recordings/${filename}`;
    const localPath = `./downloads/${filename}`;

    await sftp.connect({
      host: '195.26.249.9',
      port: 23022,
      username: 'superadmin',
      password: 'ASJDasdugas7862652kASAISIASpa',
    });

    await sftp.fastGet(remotePath, localPath);
    await sftp.end();

    return localPath;
  }*/

  async transferCall(clientChannel: string, agentExtension: string) {
    return new Promise((resolve, reject) => {
      this.ami.action(
        {
          Action: 'Redirect',
          Channel: clientChannel,
          Context: 'default',
          Exten: agentExtension,
          Priority: 1,
        },
        (err, res) => (err ? reject(err) : resolve(res)),
      );
    });
  }

  async ParckCall(body: CallDTO) {
    const replace = this.actives.find((item) => item.agent == body.agent);
    return new Promise((resolve, reject) => {
      this.ami.action(
        {
          Action: 'Park',
          Channel: body.client, // Cliente
          Channel2: replace?.agentChannel, // Agente que aparca
          Timeout: 45000,
        },
        (err, res) => (err ? reject(err) : resolve(res)),
      );
    });
  }
}
