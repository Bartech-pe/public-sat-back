import { Module } from '@nestjs/common';
import { CarteraDetalleService } from './cartera-detalle.service';
import { CarteraDetalleController } from './cartera-detalle.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CarteraDetalle } from './entities/cartera-detalle.entity';
import { CarteraDetalleRepository } from './repositories/cartera-detalle.repository';
import { InformacionCaso } from '@modules/cartera-detalle/entities/informacion-caso.entity';
import { InformacionCasoRepository } from './repositories/informacion-caso.repository';

@Module({
  imports: [SequelizeModule.forFeature([CarteraDetalle, InformacionCaso])],
  controllers: [CarteraDetalleController],
  providers: [
    CarteraDetalleService,
    CarteraDetalleRepository,
    InformacionCasoRepository,
  ],
  exports: [CarteraDetalleRepository, InformacionCasoRepository],
})
export class CarteraDetalleModule {}
