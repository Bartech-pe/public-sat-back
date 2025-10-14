import { SatProxy } from '@common/proxy/sat/sat.proxy';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  PapeletaInfoDto,
  TributoInfoDto,
} from '@modules/call/dto/papeleta-info.dto';
import { cleanAttributes } from '@common/helpers/object-atribute.helper';
import { PapeletaDto } from '@common/proxy/sat/dto/PapeletaDto';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { satConfig } from 'config/env';
import { TokenDto } from '@common/proxy/sat/dto/TokenDto';
import { ApiResponseProxyDTO } from '@common/proxy/ApiResponseProxyDTO';

@Injectable()
export class SaldomaticoService {
  private client: AxiosInstance;

  constructor(private satProxy: SatProxy) {
    this.client = axios.create({
      baseURL: satConfig.url,
      timeout: 10000,
      headers: {
        Accept: 'application/json',
      },
    });
  }

  async getToken() {
    const body = {
      client_id: satConfig.clientId,
      client_secret: satConfig.clientSecret,
      usuario: satConfig.user,
      clave: satConfig.pass,
      realm: satConfig.realm,
      grant_type: satConfig.grantType,
    };
    const response: AxiosResponse<TokenDto> = await this.client.post(
      '/auth/v2/login',
      body,
      { validateStatus: () => true },
    );
    const promise = new ApiResponseProxyDTO<TokenDto>();
    if (response.status != 200) {
      promise.success = false;
      promise.statusCode = response.status;
      promise.url = response.config.url || '';
      return promise;
    }
    const content = response.data;
    promise.success = true;
    promise.statusCode = response.status;
    promise.element = content;
    return promise;
  }

  async deudasInfo(
    psiTipConsulta: string,
    pvValor: string,
    piCodPer: string,
    piCodOrigen: string,
    piOrden: string,
  ) {
    const token = await this.getToken();
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token.element?.access_token}`,
        IP: '172.168.1.1',
      },
      validateStatus: () => true,
    };
    const res: AxiosResponse<PapeletaDto[]> = await this.client.get(
      `/saldomatico/saldomatico/${psiTipConsulta}/${pvValor}/${piCodPer}/${piCodOrigen}/${piOrden}`,
      config,
    );
    if (res.status == 200) {
      return res.data.map((d) => cleanAttributes(d) as PapeletaDto);
    } else if (res.status == 401) {
      throw new UnauthorizedException('Token api sat inválido');
    } else {
      throw new InternalServerErrorException();
    }
  }

  async GetPapeletaInfo(code: string, type: string): Promise<any[]> {
    const papeletasProxy = await this.satProxy.GetPapeletasTributos(
      code,
      type,
      true,
    );
    if (!papeletasProxy.success || papeletasProxy.element == null) {
      throw new InternalServerErrorException(
        `Error con  la consulta de sat genero un ${papeletasProxy.statusCode}`,
      );
    }
    let papeletas = papeletasProxy.element.map(
      (item) => cleanAttributes(item) as PapeletaDto,
    );
    const promise: PapeletaInfoDto = {
      total: 0,
      sum: 0,
      papeletas: [],
    };
    if (papeletas.length > 0) {
      papeletas = papeletas.filter((item) => item.concepto === 'Papeletas');
      const sum = papeletas.reduce((acc, element) => acc + element.monto, 0);
      const roundedSum = Math.round(sum * 100) / 100;
      promise.total = papeletas.length;
      promise.sum = roundedSum;
      promise.papeletas = papeletas;
    }
    return papeletas;
  }
  async GetTributoInfo(code: string, type: string): Promise<any[]> {
    const papeletasProxy = await this.satProxy.GetPapeletasTributos(
      code,
      type,
      false,
    );
    if (!papeletasProxy.success || papeletasProxy.element == null) {
      throw new InternalServerErrorException(
        `Error con  la consulta de sat genero un ${papeletasProxy.statusCode}`,
      );
    }
    let papeletas = papeletasProxy.element.map(
      (item) => cleanAttributes(item) as PapeletaDto,
    );
    const promise: TributoInfoDto = {
      total: 0,
      sum: 0,
      tributos: [],
    };
    if (papeletas.length > 0) {
      papeletas = papeletas.filter((item) => item.concepto !== 'Papeletas');
      const sum = papeletas.reduce((acc, element) => acc + element.monto, 0);
      const roundedSum = Math.round(sum * 100) / 100;
      promise.total = papeletas.length;
      promise.sum = roundedSum;
      promise.tributos = papeletas;
    }
    return papeletas;
  }
  async GetImpuestoPredial(pvValor: string, psiTipConsulta: string) {
    const proxy = await this.satProxy.GetPapeletasTributos(
      pvValor,
      psiTipConsulta,
      false,
    );
    if (!proxy.success || proxy.element == null) {
      throw new InternalServerErrorException(
        `Error con  la consulta de sat genero un ${proxy.statusCode}`,
      );
    }
    let tributes = proxy.element.map(
      (item) => cleanAttributes(item) as PapeletaDto,
    );
    if (tributes.length > 0) {
      tributes = tributes.filter((item) => item.concepto == 'Imp. Predial');
    }
    return tributes;
  }
}
