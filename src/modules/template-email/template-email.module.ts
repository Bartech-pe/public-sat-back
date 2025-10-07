import { Module } from '@nestjs/common';
import { TemplateEmailService } from './template-email.service';
import { TemplateEmailController } from './template-email.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TemplateEmail } from './entities/template-email.entity';
import { TemplateEmailRepository } from './repositories/template-email.repository';

@Module({
  imports: [SequelizeModule.forFeature([TemplateEmail])],
  controllers: [TemplateEmailController],
  providers: [TemplateEmailService,TemplateEmailRepository],
  exports: [TemplateEmailRepository],
})
export class TemplateEmailModule {}
