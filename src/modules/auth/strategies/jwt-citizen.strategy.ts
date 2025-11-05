import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from 'config/env';
import { ChannelCitizenRepository } from '@modules/multi-channel-chat/repositories/channel-citizen.repository';
@Injectable()
export class JwtCitizenStrategy extends PassportStrategy(
  Strategy,
  'jwt-citizen',
) {
  constructor(private service: ChannelCitizenRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secretCitizen, // usar dotenv
    });
  }

  async validate(payload: any) {
    console.log('payload', payload);
    return await this.service.findById(payload.id);
  }
}
