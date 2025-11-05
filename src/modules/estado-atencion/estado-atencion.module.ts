import { Module } from '@nestjs/common';
import { EstadoAtencionService } from './estado-atencion.service';
import { EstadoAtencionController } from './estado-atencion.controller';
import { EstadoAtencion } from './entities/estado-atencion.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { EstadoAtencionRepository } from './repositories/estado-atencion.repository';

@Module({
  imports: [SequelizeModule.forFeature([EstadoAtencion])],
  controllers: [EstadoAtencionController],
  providers: [EstadoAtencionService, EstadoAtencionRepository],
  exports: [EstadoAtencionRepository,EstadoAtencionService],
})
export class EstadoAtencionModule {}
