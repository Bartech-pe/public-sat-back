import { Module } from '@nestjs/common';
import { EstadoCampaniaService } from './estado-campania.service';
import { EstadoCampaniaController } from './estado-campania.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { EstadoCampania } from './entities/estado-campania.entity';
import { EstadoCampaniaRepository } from './repositories/estado-campania.repository';

@Module({
  imports: [SequelizeModule.forFeature([EstadoCampania])],
  controllers: [EstadoCampaniaController],
  providers: [EstadoCampaniaService, EstadoCampaniaRepository],
  exports: [EstadoCampaniaRepository],
})
export class EstadoCampaniaModule {}
