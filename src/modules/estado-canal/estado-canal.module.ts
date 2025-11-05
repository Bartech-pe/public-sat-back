import { Module } from '@nestjs/common';
import { EstadoCanalService } from './estado-canal.service';
import { EstadoCanalController } from './estado-canal.controller';
import { EstadoCanal } from './entities/estado-canal.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { EstadoCanalRepository } from './repositories/estado-canal.repository';

@Module({
  imports: [SequelizeModule.forFeature([EstadoCanal])],
  controllers: [EstadoCanalController],
  providers: [EstadoCanalService, EstadoCanalRepository],
  exports: [EstadoCanalRepository]
})
export class EstadoCanalModule {}
