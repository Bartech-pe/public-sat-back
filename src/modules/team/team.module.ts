import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Team } from './entities/team.entity';
import { TeamRepository } from './repositories/team.repository';
import { TeamUser } from './entities/team-user.entity';
import { TeamUserRepository } from './repositories/team-user.repository';

@Module({
  imports: [SequelizeModule.forFeature([Team, TeamUser])],
  controllers: [TeamController],
  providers: [TeamService, TeamRepository, TeamUserRepository],
  exports: [TeamRepository, TeamUserRepository],
})
export class TeamModule {}
