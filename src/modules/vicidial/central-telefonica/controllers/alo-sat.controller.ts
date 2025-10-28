import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { AloSatService } from '../services/alo-sat.service';
import { VicidialCampaign } from '../entities/vicidial-campaign.entity';
import { PauseAgentDto } from '../dto/pause-agent.dto';
import { CampaignSearchDto, LoginAgentDto } from '../dto/login-agent.dto';
import { VicidialUserRepository } from '@modules/user/repositories/vicidial-user.repository';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';
import {
  ChannelPhoneState,
  VicidialAgentStatus,
  VicidialAgentStatusObj,
} from '@common/enums/status-call.enum';
import { UserGateway } from '@modules/user/user.gateway';
import { CallHistoryRepository } from '@modules/call/repositories/call-history.repository';
import { VicidialPauseCode } from '@common/enums/pause-code.enum';
import { TransferCallDto, TransferSurveyDto } from '../dto/transfer-call.dto';
import { ParkCallDto } from '../dto/park-call.dto';
import { VicidialUser } from '@modules/user/entities/vicidial-user.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DispoChoiceDto } from '../dto/update-dispo.dto';
import { CreateChannelAssistanceDto } from '@modules/channel-assistance/dto/create-channel-assistance.dto';
import { ChannelAssistanceService } from '@modules/channel-assistance/channel-assistance.service';
import { RegisteerDispoDto } from '../dto/register-dispo.dto';

@ApiBearerAuth()
@Controller('alosat')
export class AloSatController {
  constructor(
    private readonly service: AloSatService,
    private readonly vicidialUserRepository: VicidialUserRepository,
    @Inject(forwardRef(() => UserGateway))
    private readonly userGateway: UserGateway,
    private readonly callHistoryRepository: CallHistoryRepository,
    private readonly channelAssistanceService: ChannelAssistanceService,
  ) {}

  @Get('user-groups')
  findAllUserGroups(): Promise<{ userGroup: string; groupName: string }[]> {
    return this.service.findUserGroups();
  }

  @Post('inbound-groups-by-campaign')
  findInboundGroupsByCampaign(
    @Body() dto: CampaignSearchDto,
  ): Promise<{ groupId: string; groupName: string }[]> {
    return this.service.findInboundGroupsByCampaign(dto.campaignId);
  }

  @Get('campaigns')
  findAllCampaigns(@CurrentUser() user: User): Promise<VicidialCampaign[]> {
    return this.service.findAllCampaigns(user.id);
  }

  @Post('call-disposition')
  findAllCallDisposition(
    @Body() dto: CampaignSearchDto,
  ): Promise<{ statusId: string; statusName: string; campaignId?: string }[]> {
    return this.service.findAllCallDisposition(dto.campaignId);
  }

  @Post('campaign-pause-codes')
  findAllCampaignPauseCodes(
    @Body() dto: CampaignSearchDto,
  ): Promise<{ pauseCode: string; pauseCodeName: string }[]> {
    return this.service.findAllCampaignPauseCode(dto.campaignId);
  }

  @Post('campaign-dials')
  findCampaignDials(
    @Body() dto: CampaignSearchDto,
  ): Promise<
    | { d1?: string; d2?: string; d3?: string; d4?: string; d5?: string }
    | undefined
  > {
    return this.service.findCampaignDials(dto.campaignId);
  }

  @Get('agent-status')
  async agentStatus(@CurrentUser() user: User): Promise<{
    state?: ChannelState;
    pauseCode?: string;
    campaignId?: string;
  }> {
    const res = (
      await this.vicidialUserRepository.getAloSatState(user)
    )?.toJSON();
    return {
      state: res?.channelState,
      pauseCode: res.pauseCode,
      campaignId: res.campaignId,
    };
  }

  @Get('all-agent-status')
  async allAgentStatus(@CurrentUser() user: User): Promise<any[]> {
    return (await this.vicidialUserRepository.getAllAloSatState()).map(
      (data) => {
        const item: VicidialUser = data.toJSON();
        const callHistory = item.user?.callHistory.filter(
          (call) => call.callStatus == 'SALE',
        )!;
        return {
          ...item,
          average: callHistory.length
            ? callHistory.reduce((a, b) => a + b.seconds, 0) /
              callHistory.length
            : 0,
          calls: callHistory.length ?? 0,
        };
      },
    );
  }

  @Post('agent-login')
  async agentLogin(
    @CurrentUser() user: User,
    @Body() dto: LoginAgentDto,
  ): Promise<any> {
    const res = await this.service.agentLogin(user.id, dto.campaignId);
    const vicidialUser = await this.vicidialUserRepository.findOne({
      where: { userId: user.id },
    });
    await vicidialUser?.update({
      channelStateId: ChannelPhoneState.PAUSED,
      campaignId: dto.campaignId,
      pauseCode: null,
      inboundGroups: dto.inboundGroups,
      sessionName: res.sessionName,
      confExten: res.confExten,
    } as VicidialUser);

    await this.service.onChangeIngroups(user.id);

    const resVdc = await this.service.checkVdc(user.id);

    if (resVdc) {
      const stateId =
        VicidialAgentStatusObj[
          resVdc.status?.toUpperCase() as VicidialAgentStatus
        ];

      await vicidialUser?.update({
        pauseCode: resVdc.pauseCode ?? null,
        channelStateId: stateId,
      } as VicidialUser);
    }

    this.userGateway.notifyPhoneStateUser(user.id);
    return res;
  }

  @Get('agent-relogin')
  async agentRelogin(@CurrentUser() user: User): Promise<any> {
    const res = await this.service.agentRelogin(user.id);
    const vicidialUser = await this.vicidialUserRepository.findOne({
      where: { userId: user.id },
    });
    await vicidialUser?.update({
      channelStateId: ChannelPhoneState.PAUSED,
      pauseCode: null,
    });
    this.userGateway.notifyPhoneStateUser(user.id);
    return res;
  }

  @Get('agent-logout')
  async agentLogout(@CurrentUser() user: User): Promise<any> {
    try {
      const res = await this.service.agentLogout(user.id);
      const vicidialUser = await this.vicidialUserRepository.findOne({
        where: { userId: user.id },
      });
      await vicidialUser?.update({
        channelStateId: ChannelPhoneState.OFFLINE,
        campaignId: null,
        pauseCode: null,
        inboundGroups: null,
        sessionName: null,
        confExten: null,
      } as VicidialUser);
      this.userGateway.notifyPhoneStateUser(user.id);
      return res;
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException('Error al desloguear usuario');
    }
  }

  @Get('agent-logout/:userId')
  async agentLogoutByUserId(@Param('userId') userId: number): Promise<any> {
    try {
      const res = await this.service.agentLogout(userId);
      const vicidialUser = await this.vicidialUserRepository.findOne({
        where: { userId: userId },
      });
      await vicidialUser?.update({
        channelStateId: ChannelPhoneState.OFFLINE,
        campaignId: null,
        pauseCode: null,
        inboundGroups: null,
        sessionName: null,
        confExten: null,
      } as VicidialUser);
      this.userGateway.notifyPhoneStateUser(userId);
      return res;
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException('Error al desloguear usuario');
    }
  }

  @Post('pause-agent')
  async pauseAgent(
    @CurrentUser() user: User,
    @Body() dto: PauseAgentDto,
  ): Promise<any> {
    try {
      const res = await this.service.pauseAgent(user.id, dto.pauseCode);
      const vicidialUser = await this.vicidialUserRepository.findOne({
        where: { userId: user.id },
      });
      await vicidialUser?.update({
        channelStateId: ChannelPhoneState.PAUSED,
        pauseCode: dto.pauseCode ?? null,
      });

      // if (dto.concluded) {
      //   const lastCall = await this.callHistoryRepository.getLastCall(user.id);

      //   if (lastCall) {
      //     await lastCall.update({
      //       callStatus: 'SALE',
      //     });
      //   }
      // }
      this.userGateway.notifyPhoneStateUser(user.id);
      return res;
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(
        'Error al cambiar usuario a pausado',
      );
    }
  }

  @Get('resume-agent')
  async resumeAgent(@CurrentUser() user: User): Promise<any> {
    try {
      const res = await this.service.resumeAgent(user.id);
      const vicidialUser = await this.vicidialUserRepository.findOne({
        where: { userId: user.id },
      });
      await vicidialUser?.update({
        channelStateId: ChannelPhoneState.READY,
        pauseCode: null,
      });
      this.userGateway.notifyPhoneStateUser(user.id);
      return res;
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(
        'Error al cambiar usuario a pausado',
      );
    }
  }

  @Get('call-info')
  async callInfo(@CurrentUser() user: User): Promise<any> {
    return this.service.getCallInfo(user.id);
  }

  @Get('end-call')
  async endCall(@CurrentUser() user: User): Promise<any> {
    const res = await this.service.endCall(user.id);
    // const vicidialUser = await this.vicidialUserRepository.findOne({
    //   where: { userId: user.id },
    // });
    // await vicidialUser?.update({
    //   channelStateId: ChannelPhoneState.PAUSED,
    //   pauseCode: VicidialPauseCode.WRAP,
    // });
    // this.userGateway.notifyPhoneStateUser(user.id);
    return res;
  }

  @Get('end-call/:userId')
  async endCallByUserId(@Param('userId') userId: number): Promise<any> {
    const res = await this.service.endCall(userId);
    // const vicidialUser = await this.vicidialUserRepository.findOne({
    //   where: { userId: userId },
    // });
    // await vicidialUser?.update({
    //   channelStateId: ChannelPhoneState.PAUSED,
    //   pauseCode: VicidialPauseCode.WRAP,
    // });
    // this.userGateway.notifyPhoneStateUser(userId);
    return res;
  }

  @Post('transfer-call')
  transferCall(
    @CurrentUser() user: User,
    @Body() dto: TransferCallDto,
  ): Promise<any> {
    return this.service.transferCall(user.id, dto.userId);
  }

  @Post('transfer-call-me')
  transferCallMe(
    @CurrentUser() user: User,
    @Body() dto: TransferCallDto,
  ): Promise<any> {
    return this.service.transferCall(dto.userId, user.id);
  }

  @Post('park-call')
  async parkCall(
    @CurrentUser() user: User,
    @Body() dto: ParkCallDto,
  ): Promise<any> {
    const res = await this.service.parkCall(user.id, dto.putOn);
    const vicidialUser = await this.vicidialUserRepository.findOne({
      where: { userId: user.id },
    });
    await vicidialUser?.update({
      channelStateId: ChannelPhoneState.INCALL,
      pauseCode: dto.putOn ? VicidialPauseCode.PARK : null,
    });
    this.userGateway.notifyPhoneStateUser(user.id);
    return res;
  }

  @Post('transfer-survey')
  transferSurvey(
    @CurrentUser() user: User,
    @Body() dto: TransferSurveyDto,
  ): Promise<any> {
    return this.service.transferSurvey(user.id, dto.dial);
  }

  @Post('update-dispo')
  updateDispo(
    @CurrentUser() user: User,
    @Body() dto: DispoChoiceDto,
  ): Promise<any> {
    return this.service.updateDispo(user.id, dto.dispoChoice, dto.pauseAgent);
  }

  @Post('alosat-assistance')
  async alosatAssistance(
    @CurrentUser() user: User,
    @Body() dtoComplete: RegisteerDispoDto,
  ): Promise<any> {
    const { pauseAgent, ...dto } = dtoComplete;
    await this.channelAssistanceService.create(dto);
    return this.service.updateDispo(user.id, dto.consultTypeCode, pauseAgent);
  }

  @Get('conf-exten-check')
  async confExtenCheck(@CurrentUser() user: User): Promise<
    | {
        status?: string;
        pauseCode?: string;
        channel?: string;
        agentChannel?: string;
      }
    | undefined
  > {
    const res = await this.service.checkVdc(user.id);

    if (res) {
      const vicidialUser = await this.vicidialUserRepository.findOne({
        where: { userId: user.id },
      });

      const stateId =
        VicidialAgentStatusObj[
          res.status?.toUpperCase() as VicidialAgentStatus
        ];

      if (
        vicidialUser?.toJSON().channelStateId != stateId ||
        (res.pauseCode && vicidialUser?.toJSON().pauseCode != res.pauseCode)
      ) {
        await vicidialUser?.update({
          pauseCode: res.pauseCode ?? null,
          channelStateId: stateId,
        } as VicidialUser);

        this.userGateway.notifyPhoneStateUser(user.id);
      }
    } else {
      await this.service.agentLogout(user.id);
      const vicidialUser = await this.vicidialUserRepository.findOne({
        where: { userId: user.id },
      });
      await vicidialUser?.update({
        channelStateId: ChannelPhoneState.OFFLINE,
        campaignId: null,
        pauseCode: null,
        inboundGroups: null,
        sessionName: null,
        confExten: null,
      } as VicidialUser);
      this.userGateway.notifyPhoneStateUser(user.id);
    }

    return res;
  }
}
