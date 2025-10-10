import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ChannelCitizenService } from '../services/channel-citizen.service';
import { UpdateCitizenBasicInformationDto } from '../dto/channel-room/update-citizen-basic-info.dto';
import { CreateChannelCitizenDto } from '../dto/channel-citizens/create-channel-citizen.dto';
import { BaseResponseDto } from '@common/dto/base-response.dto';
import { GetAttentionsOfCitizenDto } from '../dto/channel-citizens/attentions/get-attentions-of-citizen.dto';
import { Public } from '@common/decorators/public.decorator';
import { CreateSurveyDto } from '@modules/survey/dto/create-survey.dto';
import { Survey } from '@modules/survey/entities/survey.entity';
import { SurveyService } from '@modules/survey/survey.service';
import { AuthService } from '@modules/auth/auth.service';
import { JwtCitizenGuard } from '@common/guards/jwt-citizen.guard';

@Controller('channel-citizen')
export class ChannelCitizenController {
  constructor(
    private authService: AuthService,
    private channelCitizenService: ChannelCitizenService,
    private surveyService: SurveyService,
  ) {}

  @Post(':phoneNumber/request-advisor')
  @Public()
  async requestAdvisor(@Param('phoneNumber') phoneNumber: string) {
    try {
      await this.channelCitizenService.requestAdvisor(phoneNumber);
      return {
        message: 'Se ha solicitado un asesor.',
        status: 200,
      };
    } catch (error) {
      throw new HttpException(
        {
          message:
            error.message ||
            'Error al obtener la informacion básica del ciudadano.',
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':phoneNumber/basic-information')
  @Public()
  async getCitizenBasicInformation(
    @Param('phoneNumber') phoneNumber: string,
  ): Promise<UpdateCitizenBasicInformationDto> {
    try {
      return await this.channelCitizenService.getBasicInfoFromCitizen(
        phoneNumber,
      );
    } catch (error) {
      throw new HttpException(
        {
          message:
            error.message ||
            'Error al obtener la informacion básica del ciudadano.',
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Get(':dni/attentions')
  async getCommunicationsHistoryFromCitizen(
    @Param('dni') dni: string,
  ): Promise<BaseResponseDto<GetAttentionsOfCitizenDto[]>> {
    try {
      return await this.channelCitizenService.getCommunicationsHistoryFromCitizen(
        dni,
      );
    } catch (error) {
      throw new HttpException(
        {
          message:
            error.message ||
            'Error al obtener la informacion básica del ciudadano.',
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post()
  @Public()
  async createCitizen(@Body() payload: CreateChannelCitizenDto): Promise<any> {
    try {
      return await this.authService.createCitizen(payload);
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || 'Error en la creación del ciudadano.',
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('basic-information/update')
  @Public()
  async updateCitizenBasicInformation(
    @Body() payload: UpdateCitizenBasicInformationDto,
  ): Promise<UpdateCitizenBasicInformationDto> {
    try {
      return await this.channelCitizenService.updateBasicInfoFromCitizen(
        payload,
      );
    } catch (error) {
      throw new HttpException(
        {
          message:
            error.message ||
            'Error al obtener la informacion básica del ciudadano.',
        },
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Public()
  @UseGuards(JwtCitizenGuard)
  @Post('create-survey')
  SurveyCreate(@Body() dto: CreateSurveyDto): Promise<Survey> {
    return this.surveyService.create(dto);
  }
}
