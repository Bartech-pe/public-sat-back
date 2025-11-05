import { Module } from '@nestjs/common';
import { AreaCampaniaService } from './area-campania.service';
import { AreaCampaniaController } from './area-campania.controller';
import { AreaCampaniaRepository } from './repositories/area-campania.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { AreaCampaniaResponse } from './entities/area-campania.entity';

@Module({
  imports: [SequelizeModule.forFeature([AreaCampaniaResponse])],
  controllers: [AreaCampaniaController],
  providers: [AreaCampaniaService,AreaCampaniaRepository],
  exports: [AreaCampaniaRepository],
})
export class AreaCampaniaModule {}
