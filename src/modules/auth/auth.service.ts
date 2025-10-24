import { CryptHelper } from '@common/helpers/crypt.helper';
import { User } from '@modules/user/entities/user.entity';
import { UserRepository } from '@modules/user/repositories/user.repository';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthUserDTO } from './dto/auth-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@modules/role/entities/role.entity';
import { Office } from '@modules/office/entities/office.entity';
import { Department } from '@modules/department/entities/department.entity';
import { CreateChannelCitizenDto } from '@modules/multi-channel-chat/dto/channel-citizens/create-channel-citizen.dto';
import { ChannelCitizenRepository } from '@modules/multi-channel-chat/repositories/channel-citizen.repository';
import { jwtConfig } from 'config/env';

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: UserRepository,
    private jwtService: JwtService,
    private readonly channelCitizenRepository: ChannelCitizenRepository,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const result = await this.repository.findOneByEmail(email);
    if (!result) {
      throw new NotFoundException(
        'Parece que no hay ninguna cuenta asociada a este correo electrónico.',
      );
    }
    const user = result.toJSON();
    const isValidPassword = await CryptHelper.compare(password, user?.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Contraseña incorrecta.');
    }

    return this.repository.findById(user.id, {
      include: [
        {
          model: Role,
        },
        {
          model: Office,
          include: [{ model: Department }],
        },
      ],
    });
  }

  async findById(id: number): Promise<AuthUserDTO> {
    const user = await this.repository.findById(id, {
      include: [
        {
          model: Role,
        },
        {
          model: Office,
          include: [{ model: Department }],
        },
      ],
    });
    if (!user) throw new UnauthorizedException('No se encontro el usuario');

    return user;
  }

  async login(user: User, rememberMe: boolean) {
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: rememberMe ? '30d' : '1d',
      }),
    };
  }

  private async validateImageUrl(url?: string): Promise<string> {
    const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

    if (!url) return defaultAvatar;

    try {
      const res = await fetch(url, { method: 'HEAD' });

      const isImage =
        res.ok && (res.headers.get('content-type') ?? '').startsWith('image/');

      return isImage ? url : defaultAvatar;
    } catch {
      return defaultAvatar;
    }
  }
  async createCitizen(dto: CreateChannelCitizenDto) {
    const citizen = (
      await this.channelCitizenRepository.findOrCreate(
        {
          documentType: dto.documentType,
          documentNumber: dto.documentNumber,
        },
        {
          ...dto,
          fullName: dto.name,
          avatarUrl: await this.validateImageUrl(dto.avatarUrl)
        },
      )
    ).toJSON();

    console.log('citizen', citizen);

    const payload = {
      id: citizen.id,
      name: citizen.name,
      documentType: citizen.documentType,
      documentNumber: citizen.documentNumber,
      phoneNumber: citizen.phoneNumber,
      email: citizen.email,
    };

    return {
      ...payload,
      accessToken: this.jwtService.sign(payload, {
        secret: jwtConfig.secretCitizen,
        expiresIn: '1d',
      }),
    };
  }
}
