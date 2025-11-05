import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AtencionCiudadanoController } from './atencion-ciudadano.controller';
import { AtencionCiudadanoService } from './atencion-ciudadano.service';
import { AtencionCiudadano } from './entities/atencion-ciudadano.entity';
import { AtencionCiudadanoRepository } from './repositories/atencion-ciudadano.repository';
import { CarteraDetalleModule } from '@modules/cartera-detalle/cartera-detalle.module';

@Module({
  imports: [
    SequelizeModule.forFeature([AtencionCiudadano]),
    CarteraDetalleModule,
  ],
  controllers: [AtencionCiudadanoController],
  providers: [AtencionCiudadanoService, AtencionCiudadanoRepository],
  exports: [AtencionCiudadanoService, AtencionCiudadanoRepository],
})
export class AtencionCiudadanoModule {}
