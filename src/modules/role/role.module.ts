import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { Role } from './entities/role.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleService } from './role.service';
import { RoleRepository } from './repositories/role.repository';

@Module({
  imports: [SequelizeModule.forFeature([Role])],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
  exports: [RoleService, RoleRepository],
})
export class RoleModule {}
