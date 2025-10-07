import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { TokenDto } from './dto/TokenDto';
import { ApiResponseProxyDTO } from '../ApiResponseProxyDTO';
import { PapeletaDto } from './dto/PapeletaDto';
import { satConfig } from 'config/env';

@Injectable()
export class SatProxy {
  private client: AxiosInstance;
  constructor() {
    this.client = axios.create({
      baseURL: satConfig.url,
      timeout: 10000,
      headers: {
        Accept: 'application/json',
      },
    });
  }
  async getToken(): Promise<ApiResponseProxyDTO<TokenDto>> {
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
  async GetPapeletasTributos(
    pvValor: string,
    psiTipConsulta: string,
    isPapeleta: boolean,
  ) {
    const token = await this.getToken();
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token.element?.access_token}`,
        IP: '172.168.1.1',
      },
      validateStatus: () => true,
    };
    const response: AxiosResponse<PapeletaDto[]> = await this.client.get(
      `/saldomatico/saldomatico/${psiTipConsulta}/${pvValor}/0/10/${isPapeleta ? 11 : 10}`,
      config,
    );
    const promise = new ApiResponseProxyDTO<PapeletaDto[]>();
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

  async GetPapeletasTributosAll(
    pvValor: string,
    psiTipConsulta: string,
    isPapeleta: boolean,
  ) {
    const token = await this.getToken();
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token.element?.access_token}`,
        IP: '172.168.1.1',
      },
      validateStatus: () => true,
    };
    const response: AxiosResponse<PapeletaDto[]> = await this.client.get(
      `/saldomatico/saldomatico/${psiTipConsulta}/${pvValor}/0/10/${isPapeleta ? 11 : 10}`,
      config,
    );
    const promise = new ApiResponseProxyDTO<PapeletaDto[]>();
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
}
