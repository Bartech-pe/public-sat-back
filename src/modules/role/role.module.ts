import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { Role } from './entities/role.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { RoleService } from './role.service';
import { RoleRepository } from './repositories/role.repository';
import { RoleScreen } from './entities/role-screen.entity';
import { RoleScreenRepository } from './repositories/role-screen.repository';

@Module({
  imports: [SequelizeModule.forFeature([Role, RoleScreen])],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, RoleScreenRepository],
  exports: [RoleService, RoleRepository, RoleScreenRepository],
})
export class RoleModule {}
