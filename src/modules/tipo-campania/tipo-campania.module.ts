import { Module } from '@nestjs/common';
import { TipoCampaniaService } from './tipo-campania.service';
import { TipoCampaniaController } from './tipo-campania.controller';
import { TipoCampaniaRepository } from './repositories/tipo-campania.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { TipoCampaniaResponse } from './entities/tipo-campania.entity';

@Module({
  imports: [SequelizeModule.forFeature([TipoCampaniaResponse])],
  controllers: [TipoCampaniaController],
  providers: [TipoCampaniaService,TipoCampaniaRepository],
   exports: [TipoCampaniaRepository],
})
export class TipoCampaniaModule {}
