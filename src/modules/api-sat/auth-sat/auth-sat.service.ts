import { TokenDto } from '@common/proxy/sat/dto/TokenDto';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { apiSatConfig } from 'config/env';

@Injectable()
export class AuthSatService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: apiSatConfig.authUrl,
      timeout: 10000,
      headers: {
        Accept: 'application/json',
      },
    });
  }

  async getToken() {
    const body = {
      client_id: apiSatConfig.authClientId,
      client_secret: apiSatConfig.authClientSecret,
      realm: apiSatConfig.authRealm,
      grant_type: apiSatConfig.authGrantType,
    };
    const res: AxiosResponse<TokenDto> = await this.client.post(
      '/login',
      body
    );
    if (res.status == 200) {
      return res.data.access_token;
    } else if (res.status == 401) {
      throw new UnauthorizedException('Credenciales inválidas');
    } else {
      throw new InternalServerErrorException();
    }
  }
}
