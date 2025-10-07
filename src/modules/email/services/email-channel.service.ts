import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { AttachementBody, BuildCenterEmail } from '../dto/build-email.dto';
import { Tokencode } from '../dto/email-channel/token-code.dto';
import { ReplyEmail } from '../dto/email-channel/reply-email.dto';
import { ForwardTo } from '../dto/email-channel/forward-to.dto';
import { EmailSent } from '../dto/center-email.dto';
import { channelConnectorConfig } from 'config/env';

@Injectable()
export class EmailChannelService {
  private client: AxiosInstance;
  constructor() {
    this.client = axios.create({
      baseURL: channelConnectorConfig.baseUrl,
      timeout: 10000,
      headers: {
        Accept: 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          'Error desconocido en GmailChannelService';

        console.error(`Error Axios: ${message}`);

        return Promise.resolve({
          error: true,
          message: `Error Axios: ${message}`,
          status: error.response?.status || 500,
        });
      },
    );
  }
  async login(email: string) {
    const response: AxiosResponse<any> = await this.client.post(`/mail`, {
      email: email,
    });
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el login AuthUrl de ${response.status}`,
      );
    }
    return response.data;
  }
  async setOAuth(clientId: string, clientSecret: string) {
    const response: AxiosResponse<any> = await this.client.post(
      `/mail/setOAuth`,
      { clientId: clientId, clientSecret: clientSecret },
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el login AuthUrl de ${response.status}`,
      );
    }
    return response.data;
  }
  async setWatch(refreshToken: string, topicName: string, projectId: string) {
    const response: AxiosResponse<any> = await this.client.post(
      `/mail/setWatch`,
      {
        refreshToken: refreshToken,
        topicName: topicName,
        projectId: projectId,
      },
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el login AuthUrl de ${response.status}`,
      );
    }
    return response.data;
  }
  async exchangeCode(code: string) {
    const response: AxiosResponse<Tokencode> = await this.client.post(
      `mail/code`,
      { code: code },
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el exchangeCode de ${response.status}`,
      );
    }
    return response.data;
  }
  async refreshToken(email: string) {
    const response: AxiosResponse<any> = await this.client.get(
      `mail/refresh/${email}`,
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el refreshToken de ${response.status}`,
      );
    }
    return response.data;
  }
  async refreshSetToken(email: string) {
    const response: AxiosResponse<any> = await this.client.get(
      `mail/refreshset/${email}`,
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el refreshToken de ${response.status}`,
      );
    }
    return response.data;
  }
  async sendEmail(body: BuildCenterEmail) {
    const response: AxiosResponse<EmailSent> = await this.client.post(
      `mail/sendemail`,
      body,
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el send Mail de ${response.status}`,
      );
    }
    return response.data;
  }
  async GetMessage(messageId: string) {
    const response: AxiosResponse<any> = await this.client.get(
      `/mail/messages/${messageId}`,
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el Message de ${response.status}`,
      );
    }
    return response.data;
  }
  async GetMessages(body: {
    query?: string;
    maxResults?: number;
    pageToken?: string;
    accessToken: string;
    refreshToken: string;
  }) {
    const response: AxiosResponse<any> = await this.client.post(
      `mail/messages`,
      body,
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el GetMessages de ${response.status}`,
      );
    }
    return response.data;
  }
  async getAtachment(body: AttachementBody) {
    const response: AxiosResponse<ArrayBuffer> = await this.client.post(
      `mailAttachment/AttachmentFile`,
      body,
      { responseType: 'arraybuffer' },
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para conseguir el archivo de ${response.status}`,
      );
    }
    return Buffer.from(new Uint8Array(response.data as any));
  }
  async getAtachmentv2(body: AttachementBody) {
    const response: AxiosResponse<ArrayBuffer> = await this.client.post(
      `mailAttachment/see`,
      body,
      { responseType: 'arraybuffer' },
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para conseguir el archivo de ${response.status}`,
      );
    }
    return Buffer.from(new Uint8Array(response.data));
  }
  async replyEmail(body: ReplyEmail) {
    const response: AxiosResponse<any> = await this.client.post(
      `mail/replyemail`,
      body,
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el send Mail de ${response.status}`,
      );
    }
    return response.data;
  }
  async forwardTo(body: ForwardTo) {
    const response: AxiosResponse<any> = await this.client.post(
      `mail/forwardto`,
      body,
    );
    if (response.status < 200 || response.status >= 300) {
      throw new InternalServerErrorException(
        `Error con la peticion para el send Mail de ${response.status}`,
      );
    }
    return response.data;
  }
}
