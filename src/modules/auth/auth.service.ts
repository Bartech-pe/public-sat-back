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
import { Oficina } from '@modules/oficina/entities/oficina.entity';
import { Area } from '@modules/area/entities/area.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: UserRepository,
    private jwtService: JwtService,
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
          model: Oficina,
          include: [{ model: Area }],
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
          model: Oficina,
          include: [{ model: Area }],
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
}
