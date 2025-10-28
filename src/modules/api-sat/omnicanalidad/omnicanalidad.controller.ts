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
import { Public } from '@common/decorators/public.decorator';
import { Citizen } from '@modules/citizen/entities/citizen.entity';
import { CitizenService } from '@modules/citizen/services/citizen.service';

@Public()
@Controller('omnicanalidad')
export class OmnicanalidadController {
  private client: AxiosInstance;

  constructor(
    private readonly authSatService: AuthSatService,
    private readonly citizenService: CitizenService,
  ) {
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
    @Param('psiTipConsulta') psiTipConsulta: '1' | '2',
    @Param('piValPar1') piValPar1: string,
    @Param('pvValPar2') pvValPar2: string,
  ) {
    try {
      const token = await this.authSatService.getToken();

      const res: AxiosResponse<ContactoDto[]> = await this.client.get(
        `/contacto/listado/${psiTipConsulta}/${piValPar1}/${pvValPar2}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          validateStatus: () => true, // para controlar manualmente los errores HTTP
        },
      );

      // Si la respuesta es exitosa
      if (res.status === 200 && Array.isArray(res.data)) {
        if (res.data.length === 0) {
          return await this.citizenService.getBasicInfoFromCitizen(piValPar1);
        }
        return res.data.map(
          (d) =>
            ({
              tipDoc: d.vtipDoc,
              docIde: d.vdocIde,
            }) as Citizen,
        );
      }

      // Si no encontró resultados en la API externa
      if (
        res.status === 204 ||
        (Array.isArray(res.data) && res.data.length === 0)
      ) {
        // Buscar localmente
        return await this.citizenService.getBasicInfoFromCitizen(piValPar1);
      }

      // Si el token no es válido
      if (res.status === 401) {
        throw new UnauthorizedException('Token API SAT inválido');
      }

      // Otros errores de la API externa
      throw new InternalServerErrorException(
        `Error al consultar API SAT: ${res.status}`,
      );
    } catch (error) {
      // Si hubo error en la llamada externa, buscar localmente
      console.error('Error al consultar API externa:', error.message || error);
      return await this.citizenService.getBasicInfoFromCitizen(piValPar1);
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
