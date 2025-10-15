import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { metabaseConfig } from 'config/env';

@Injectable()
export class MetabaseService {
  constructor(private jwtService: JwtService) {}
  generateDashboardUrl(id: number, params: Record<string, any> = {}): string {
    const payload = {
      resource: { dashboard: id },
      params,
    };
    const token = this.jwtService.sign(payload, {
      secret: metabaseConfig.secret,
      expiresIn: '10m',
    });

    const iframeUrl = `${metabaseConfig.url}/embed/dashboard/${token}#bordered=true&titled=true`;
    return iframeUrl;
  }
}
