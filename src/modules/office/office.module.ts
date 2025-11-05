import { Module } from '@nestjs/common';
import { OfficeService } from './office.service';
import { OfficeController } from './office.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Office } from './entities/office.entity';
import { OfficeRepository } from './repositories/office.repository';
import { RoleScreenOfficeRepository } from './repositories/role-screen-office.repository';
import { RoleScreenOffice } from './entities/role-screen-office.entity';

@Module({
  imports: [SequelizeModule.forFeature([Office, RoleScreenOffice])],
  controllers: [OfficeController],
  providers: [OfficeService, OfficeRepository, RoleScreenOfficeRepository],
  exports: [OfficeService, OfficeRepository, RoleScreenOfficeRepository],
})
export class OfficeModule {}
