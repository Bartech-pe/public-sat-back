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
import { LoginAgentDto } from '../dto/login-agent.dto';
import { VicidialUserRepository } from '@modules/user/repositories/vicidial-user.repository';
import { ChannelState } from '@modules/channel-state/entities/channel-state.entity';
import { ChannelPhoneState } from '@common/enums/status-call.enum';
import { UserGateway } from '@modules/user/user.gateway';
import { CallHistoryRepository } from '@modules/call/repositories/call-history.repository';
import { VicidialPauseCode } from '@common/enums/pause-code.enum';
import { TransferCallDto } from '../dto/transfer-call.dto';
import { ParkCallDto } from '../dto/park-call.dto';
import { VicidialUser } from '@modules/user/entities/vicidial-user.entity';

@Controller('alosat')
export class AloSatController {
  constructor(
    private readonly service: AloSatService,
    private readonly vicidialUserRepository: VicidialUserRepository,
    @Inject(forwardRef(() => UserGateway))
    private readonly userGateway: UserGateway,
    private readonly callHistoryRepository: CallHistoryRepository,
  ) {}

  @Get('campaigns')
  findAll(@CurrentUser() user: User): Promise<VicidialCampaign[]> {
    return this.service.findAllCampaigns(user.id);
  }

  @Get('agent-status')
  async agentStatus(
    @CurrentUser() user: User,
  ): Promise<{ state?: ChannelState; pauseCode?: string }> {
    const res = (
      await this.vicidialUserRepository.getAloSatState(user)
    )?.toJSON();
    return {
      state: res?.channelState,
      pauseCode: res.pauseCode,
    };
  }

  @Get('all-agent-status')
  async allAgentStatus(@CurrentUser() user: User): Promise<VicidialUser[]> {
    return await this.vicidialUserRepository.getAllAloSatState();
  }

  @Post('agent-login')
  async agentLogin(
    @CurrentUser() user: User,
    @Body() dto: LoginAgentDto,
  ): Promise<any> {
    console.log('dto', dto);
    const res = await this.service.agentLogin(user.id, dto.idCampaign);
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
        pauseCode: null,
      });
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
        pauseCode: null,
      });
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
        pauseCode: dto.pauseCode,
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
    const res = await this.service.getCallInfo(user.id);
    return res;
  }

  @Get('last-call-info')
  async lastCallInfo(@CurrentUser() user: User): Promise<any> {
    const res = await this.callHistoryRepository.getLastCallOfTheDay(user.id);
    // await this.callHistoryRepository.setDurationCall(user.id);
    return res;
  }

  @Get('end-call')
  async endCall(@CurrentUser() user: User): Promise<any> {
    const res = await this.service.endCall(user.id);
    const vicidialUser = await this.vicidialUserRepository.findOne({
      where: { userId: user.id },
    });
    await vicidialUser?.update({
      channelStateId: ChannelPhoneState.PAUSED,
      pauseCode: VicidialPauseCode.WRAP,
    });
    this.userGateway.notifyPhoneStateUser(user.id);
    return res;
  }

  @Get('end-call/:userId')
  async endCallByUserId(@Param('userId') userId: number): Promise<any> {
    const res = await this.service.endCall(userId);
    const vicidialUser = await this.vicidialUserRepository.findOne({
      where: { userId: userId },
    });
    await vicidialUser?.update({
      channelStateId: ChannelPhoneState.PAUSED,
      pauseCode: VicidialPauseCode.WRAP,
    });
    this.userGateway.notifyPhoneStateUser(userId);
    return res;
  }

  @Post('transfer-call')
  transferCall(
    @CurrentUser() user: User,
    @Body() dto: TransferCallDto,
  ): Promise<any> {
    console.log('dto', dto);
    return this.service.transferCall(user.id, dto.userId);
  }

  @Post('transfer-call-me')
  transferCallMe(
    @CurrentUser() user: User,
    @Body() dto: TransferCallDto,
  ): Promise<any> {
    console.log('dto', dto);
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
}
