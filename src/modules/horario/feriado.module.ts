import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Feriado } from './entities/feriado.entity';
import { Horario } from './entities/horario.entity';
import { FeriadoController } from './controller/feriado.controller';
import { FeriadoService } from './service/feriado.service';
import { HorarioRepository } from './repositories/horario.repository';
import { FeriadoRepository } from './repositories/feriado.repository';
import { CentralTelefonicaModule } from '@modules/central-telefonica/central-telefonica.module';
import { HorarioController } from './controller/horario.controller';
import { HorarioService } from './service/horario.service';

@Module({
  imports: [SequelizeModule.forFeature([Feriado,Horario]),CentralTelefonicaModule],
  controllers: [FeriadoController,HorarioController],
  providers: [FeriadoService,HorarioService,FeriadoRepository,HorarioRepository],
  exports: [HorarioService],
})
export class FeriadoModule {
}
