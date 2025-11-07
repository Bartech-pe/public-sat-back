import { Module } from '@nestjs/common';
import { EmailTemplateService } from './email-template.service';
import { EmailTemplateController } from './email-template.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { EmailTemplate } from './entities/email-template.entity';
import { EmailTemplateRepository } from './repositories/email-template.repository';

@Module({
  imports: [SequelizeModule.forFeature([EmailTemplate])],
  controllers: [EmailTemplateController],
  providers: [EmailTemplateService,EmailTemplateRepository],
  exports: [EmailTemplateRepository],
})
export class EmailTemplateModule {}
