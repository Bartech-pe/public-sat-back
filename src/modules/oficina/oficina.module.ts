import { Module } from '@nestjs/common';
import { OficinaService } from './oficina.service';
import { OficinaController } from './oficina.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Oficina } from './entities/oficina.entity';
import { OficinaRepository } from './repositories/oficina.repository';

@Module({
  imports: [SequelizeModule.forFeature([Oficina])],
  controllers: [OficinaController],
  providers: [OficinaService, OficinaRepository],
  exports: [OficinaService, OficinaRepository],
})
export class OficinaModule {}
