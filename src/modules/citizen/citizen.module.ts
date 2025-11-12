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
import { CitizenContactRepository } from './repositories/citizen-contact.repository';
import { CitizenContact } from './entities/citizen-contact.entity';
import { TypeContact } from './entities/type-contact.entity';
import { TypeContactController } from './controllers/type-contact.controller';
import { TypeContactService } from './services/type-contact.service';
import { TypeContactRepository } from './repositories/type-contact.repository';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Citizen,
      TypeIdeDoc,
      TypeContact,
      CitizenContact,
    ]),
  ],
  controllers: [CitizenController, TypeIdeDocController, TypeContactController],
  providers: [
    CitizenService,
    CitizenRepository,
    TypeIdeDocService,
    TypeIdeDocRepository,
    CitizenContactRepository,
    TypeContactService,
    TypeContactRepository,
  ],
  exports: [
    CitizenService,
    CitizenRepository,
    TypeIdeDocRepository,
    CitizenContactRepository,
    TypeContactService,
    TypeContactRepository,
  ],
})
export class CitizenModule {}
