import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Cartera } from './entities/cartera.entity';
import { CarteraRepository } from './repositories/cartera.repository';
import { CarteraService } from './carteras.service';
import { CarteraController } from './carteras.controller';
import { CarteraDetalleRepository } from '@modules/cartera-detalle/repositories/cartera-detalle.repository';

@Module({
  imports: [SequelizeModule.forFeature([Cartera])],
  controllers: [CarteraController],
  providers: [CarteraService, CarteraRepository],
  exports: [CarteraRepository],
})
export class CarterasModule {}
