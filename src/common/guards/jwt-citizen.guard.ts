// auth/guards/jwt-client.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtCitizenGuard extends AuthGuard('jwt-citizen') {}
