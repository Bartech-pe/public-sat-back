import { Module } from '@nestjs/common';
import { MensajeAutomaticoService } from './mensaje-automatico.service';
import { MensajeAutomaticoController } from './mensaje-automatico.controller';
import { MensajeAutomaticoRepository } from './repositories/mensaje-automatico.repository';
import { SequelizeModule } from '@nestjs/sequelize';
import { MensajeAutomatico } from './entities/mensaje-automatico.entity';

@Module({
  imports: [SequelizeModule.forFeature([MensajeAutomatico])],
  controllers: [MensajeAutomaticoController],
  providers: [MensajeAutomaticoService, MensajeAutomaticoRepository],
  exports: [MensajeAutomaticoRepository],
})
export class MensajeAutomaticoModule {}
