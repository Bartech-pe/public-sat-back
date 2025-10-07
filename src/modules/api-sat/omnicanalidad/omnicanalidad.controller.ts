import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { apiSatConfig } from 'config/env';
import { ContactoDto } from './dto/Contacto.dto';
import { AuthSatService } from '../auth-sat/auth-sat.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('omnicanalidad')
export class OmnicanalidadController {
  private client: AxiosInstance;

  constructor(private authSatService: AuthSatService) {
    this.client = axios.create({
      baseURL: apiSatConfig.url,
      timeout: 50000,
      headers: {
        Accept: 'application/json',
      },
    });
  }

  @Get('contacto/listado/:psiTipConsulta/:piValPar1/:pvValPar2')
  async infoContactoCelular(
    @Param('psiTipConsulta') psiTipConsulta: 1 | 2,
    @Param('piValPar1') piValPar1: 1 | 2 | number,
    @Param('pvValPar2') pvValPar2: 'empty' | string,
  ) {
    try {
      const res: AxiosResponse<ContactoDto[]> = await this.client.get(
        `/contacto/listado/${psiTipConsulta}/${piValPar1}/${pvValPar2}`,
        // { ...this.config },
      );
      //   console.log('res', res);
      if (res.status == 200) {
        return res.data;
      } else if (res.status == 401) {
        throw new UnauthorizedException('Token api sat inválido');
      } else {
        throw new InternalServerErrorException();
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new InternalServerErrorException(
        error.response?.data || error.message,
      );
    }
  }

  @Get('solicitud/consultarTramite/:psiTipDId/:numDoc')
  async consultarTramite(
    @Param('psiTipDId') psiTipDId: 1 | 2,
    @Param('numDoc') numDoc: number,
  ) {
    try {
      const res: AxiosResponse<any[]> = await this.client.get(
        `/solicitud/consultarTramite/${psiTipDId}/${numDoc}`,
        {
          headers: {
            Authorization: `Bearer ${await this.authSatService.getToken()}`,
          },
          validateStatus: () => true,
        },
      );
      //   console.log('res', res);
      if (res.status == 200) {
        return res.data;
      } else if (res.status == 401) {
        throw new UnauthorizedException('Token api sat inválido');
      } else {
        throw new InternalServerErrorException();
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new InternalServerErrorException(
        error.response?.data || error.message,
      );
    }
  }

  @Get('deuda/consultarPapeleta/:psiTipDId/:numDoc')
  async consultarPapeleta(
    @Param('psiTipDId') psiTipDId: number,
    @Param('numDoc') numDoc: number,
  ) {
    try {
      const res: AxiosResponse<any[]> = await this.client.get(
        `/deuda/consultarPapeleta/${psiTipDId}/${numDoc}`,
        {
          headers: {
            Authorization: `Bearer ${await this.authSatService.getToken()}`,
          },
          validateStatus: () => true,
        },
      );
      if (res.status == 200) {
        return res.data;
      } else if (res.status == 401) {
        throw new UnauthorizedException('Token api sat inválido');
      } else {
        throw new InternalServerErrorException();
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new InternalServerErrorException(
        error.response?.data || error.message,
      );
    }
  }

  @Get('deuda/consultarMultaAdm/:psiTipDId/:numDoc')
  async consultarMultaAdm(
    @Param('psiTipDId') psiTipDId: number,
    @Param('numDoc') numDoc: number,
  ) {
    try {
      const res: AxiosResponse<any[]> = await this.client.get(
        `/deuda/consultarMultaAdm/${psiTipDId}/${numDoc}`,
        {
          headers: {
            Authorization: `Bearer ${await this.authSatService.getToken()}`,
          },
          validateStatus: () => true,
        },
      );
      //   console.log('res', res);
      if (res.status == 200) {
        return res.data;
      } else if (res.status == 401) {
        throw new UnauthorizedException('Token api sat inválido');
      } else {
        throw new InternalServerErrorException();
      }
    } catch (error) {
      console.error(error.response?.data || error.message);
      throw new InternalServerErrorException(
        error.response?.data || error.message,
      );
    }
  }
}
