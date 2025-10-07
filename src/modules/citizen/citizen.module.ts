import { Module } from '@nestjs/common';
import { CitizenService } from './services/citizen.service';
import { CitizenController } from './controllers/citizen.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Citizen } from './entities/citizen.entity';
import { CitizenRepository } from './repositories/citizen.repository';
import { TypeIdeDoc } from './entities/type-ide-doc.entity';
import { TypeIdeDocController } from './controllers/type-ide-doc.controller';
import { TypeIdeDocService } from './services/type-ide-doc.service';
import { TypeIdeDocRepository } from './repositories/type-ide-doc.repository';

@Module({
  imports: [SequelizeModule.forFeature([Citizen, TypeIdeDoc])],
  controllers: [CitizenController, TypeIdeDocController],
  providers: [
    CitizenService,
    CitizenRepository,
    TypeIdeDocService,
    TypeIdeDocRepository,
  ],
  exports: [CitizenRepository, TypeIdeDocRepository],
})
export class CitizenModule {}
