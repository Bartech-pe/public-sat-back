import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { HolidayRepository } from '../repositories/holiday.repository';
import { CreateScheduleDto } from '../dto/schedule/create-schedule.dto';
import { UpdateScheduleDto } from '../dto/schedule/update-schedule.dto';
import { Op } from 'sequelize';
import { Weekday } from '../enum/weekday.enum';
import { Campaign } from '@modules/campaign/entities/campaign.entity';
import { VicidialCampaingRepository } from '@modules/vicidial/central-telefonica/repositories/vicidial-campaing.repository';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly repository: ScheduleRepository,
    private readonly holidayRepository: HolidayRepository,
    private readonly campaignModel: VicidialCampaingRepository,
  ) {}

  async findById(id: number) {
    return await this.repository.findById(id);
  }

  async findByCampingId(campaignId: number) {
    return await this.repository.findOne({ where: { campaignId } });
  }

  async create(body: CreateScheduleDto) {
    const campaignId = body.campaignId;
    const exist = await this.repository.findOne({
      where: { campaignId },
    });
    if (exist) {
      throw new NotFoundException('campania con horario ya existente');
    }
    try {
      return await this.repository.create(body);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
  //@Cron('0 * * * *')
  //@Cron('* * * * *')
  // @Cron('0,30 * * * *')
  async changeActive() {
    const actual = new Date();
    const hour = actual.toTimeString().slice(0, 8);
    const day = actual.toISOString().slice(0, 10);
    const feriados = await this.holidayRepository.findAll();
    const esHolidayHoy = feriados.some((f) => f.toJSON().feriado_fecha === day);
    console.log('esHolidayHoy', esHolidayHoy);
    const times = await this.repository.findAll({
      include: [
        {
          model: Campaign,
          as: 'gestion_campania',
        },
      ],
    });
    const timeJson = times.map((t) => t.toJSON());
    const debenEstarActivos: any[] = [];
    const debenEstarInactivos: any[] = [];
    timeJson.forEach((horario) => {
      const diaValido = day >= horario.dia_inicio && day <= horario.dia_fin;
      const horaValida =
        hour >= horario.hora_inicio && hour <= horario.hora_fin;
      const feriadoValido = esHolidayHoy ? horario.feriado : !horario.feriado;
      const debeEstarActivo = diaValido && horaValida && feriadoValido;
      if (debeEstarActivo) {
        debenEstarActivos.push(horario);
      } else {
        debenEstarInactivos.push(horario);
      }
    });
    const campaniasParaActivar = debenEstarActivos
      .map((h) => h.gestion_campania?.campaniaId)
      .filter((id): id is string => !!id);
    const campaniasParaDesactivar = debenEstarInactivos
      .map((h) => h.gestion_campania?.campaniaId)
      .filter((id): id is string => !!id);
    const vicidial_campanias_Y = await this.campaignModel.getModel().update(
      { active: 'Y' },
      {
        where: {
          campaignId: { [Op.in]: campaniasParaActivar },
          active: 'N',
        },
      },
    );
    const vicidial_campanias_N = await this.campaignModel.getModel().update(
      { active: 'N' },
      {
        where: {
          campaignId: { [Op.in]: campaniasParaDesactivar },
          active: 'Y',
        },
      },
    );
    const result = {
      success: true,
      rows_Y: vicidial_campanias_Y,
      row_N: vicidial_campanias_N,
    };
    return result;
  }
  async update(id: number, body: UpdateScheduleDto) {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundException('horario no existe');
    }
    try {
      return await this.repository.update(id, body);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
  async delete(id: number) {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundException('horario no existe');
    }
    try {
      return await this.repository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
  async deleteByCampain(id: number) {
    const campain = await this.findByCampingId(id);
    if (!campain) {
      throw new NotFoundException('campania no existe');
    }
    const horario_id = campain?.toJSON().id;
    try {
      return await this.repository.delete(horario_id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }
  getAllDays() {
    return Object.values(Weekday)
      .filter((value) => typeof value === 'number')
      .map((num: number) => ({
        number: num,
        name: Weekday[num],
      }));
  }
}
