import { Module } from '@nestjs/common';
import { AsignarCarteraService } from './asignar-cartera.service';
import { AsignarCarteraController } from './asignar-cartera.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { AsignarCartera } from './entities/asignar-cartera.entity';
import { AsignarCarteraRepository } from './repositories/asignar-cartera.repository';
import { CarteraDetalle } from '@modules/cartera-detalle/entities/cartera-detalle.entity';

@Module({
  imports: [SequelizeModule.forFeature([AsignarCartera,CarteraDetalle])],
  controllers: [AsignarCarteraController],
  providers: [AsignarCarteraService, AsignarCarteraRepository],
  exports: [AsignarCarteraRepository],
})
export class AsignarCarteraModule {}
