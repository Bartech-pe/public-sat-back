import { ApiProperty } from '@nestjs/swagger';

export class AdvisorsResponseDto {
  @ApiProperty({ description: 'ID del usuario', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Nombre interno del usuario (rol o identificador técnico)',
    example: 'Administrador',
  })
  name: string;

  @ApiProperty({
    description: 'Nombre visible del usuario',
    example: 'Administrador',
  })
  displayName: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'admin@mail.com',
  })
  email: string;

  @ApiProperty({
    description: 'URL del avatar del usuario',
    example: 'https://png.pngtree.com/...png',
  })
  avatarUrl: string;
}
