import { Module } from '@nestjs/common';
import { SkillService } from './skill.service';
import { SkillController } from './skill.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Skill } from './entities/skill.entity';
import { SkillUser } from './entities/skill-user.entity';
import { SkillRepository } from './repositories/skill.repository';
import { SkillUserRepository } from './repositories/skill-user.repository';

@Module({
  imports: [SequelizeModule.forFeature([Skill, SkillUser])],
    controllers: [SkillController],
    providers: [SkillService, SkillRepository, SkillUserRepository],
    exports: [SkillRepository, SkillUserRepository],
})
export class SkillModule {}
