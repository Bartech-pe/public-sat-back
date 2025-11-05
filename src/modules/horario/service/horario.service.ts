import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { HorarioRepository } from "../repositories/horario.repository";
import { FeriadoRepository } from "../repositories/feriado.repository";
import { CreateHorario } from "../dto/horario/create-horario.dto";
import { UpdateHorario } from "../dto/horario/update-horario.dto";
import { GestionCampaniaRepository } from "@modules/gestion-campania/repositories/gestion-campania.repository";
import { GestionCampaniaResponse } from "@modules/gestion-campania/entities/gestion-campania.entity";
import { InjectModel } from "@nestjs/sequelize";
import { VicidialCampaign } from "@modules/central-telefonica/entities/vicidial-campaign.entity";
import { Op } from "sequelize";
import { DiaSemana } from "../enum/DiaSemana.enum";
import { VicidialCampaingRepository } from "@modules/central-telefonica/repositories/vicidialCampaing.repository";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class HorarioService {
    constructor(private readonly repository:HorarioRepository,
    private readonly feriadoRepository:FeriadoRepository,
    private readonly campaignModel: VicidialCampaingRepository){}
    async findById(id:number){
        return await this.repository.findById(id);
    }
    async findByCampingId(gestion_campania_id:number){
        return  await this.repository.findOne({ where: { gestion_campania_id } })
    }
    async create(body:CreateHorario){
        const gestion_campania_id = body.gestion_campania_id;
        const exist = await this.repository.findOne({ where: { gestion_campania_id } })
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
    async changeActive(){
        const actual = new Date();
        const hour = actual.toTimeString().slice(0, 8);
        const day = actual.toISOString().slice(0, 10);;
        const feriados = await this.feriadoRepository.findAll();
        const esFeriadoHoy = feriados.some(f => 
            f.toJSON().feriado_fecha === day
        );
        console.log('esFeriadoHoy',esFeriadoHoy)
        const times = await this.repository.findAll({include:[{
            model:GestionCampaniaResponse,
            as: 'gestion_campania',}
        ]
        });
        const timeJson = times.map(t => t.toJSON());
        const debenEstarActivos: any[] = [];
        const debenEstarInactivos: any[] = [];
        timeJson.forEach(horario => {
            const diaValido = day >= horario.dia_inicio && day <= horario.dia_fin;
            const horaValida = hour >= horario.hora_inicio && hour <= horario.hora_fin;
            const feriadoValido = esFeriadoHoy ? horario.feriado : !horario.feriado;
            const debeEstarActivo = diaValido && horaValida && feriadoValido;
            if (debeEstarActivo) {
                debenEstarActivos.push(horario);
            } else {
                debenEstarInactivos.push(horario);
            }
        });
       const campaniasParaActivar = debenEstarActivos
                .map(h => h.gestion_campania?.campaniaId)
                .filter((id): id is string => !!id);
        const campaniasParaDesactivar = debenEstarInactivos
                .map(h => h.gestion_campania?.campaniaId)
                .filter((id): id is string => !!id);
       const vicidial_campanias_Y = await this.campaignModel.getModel().update(
            { active: 'Y' },
            {
                where: {
                    campaign_id: { [Op.in]: campaniasParaActivar },
                    active: 'N'
                }
            }
        );
         const vicidial_campanias_N = await this.campaignModel.getModel().update(
            { active: 'N' },
            {
                where: {
                    campaign_id: { [Op.in]: campaniasParaDesactivar },
                    active: 'Y'
                }
            }
        );
        const result={"success":true,"rows_Y":vicidial_campanias_Y,"row_N":vicidial_campanias_N}
        return result
    }
    async update(id:number,body:UpdateHorario){
        const exist = await this.repository.findById(id);
        if (!exist) {
            throw new NotFoundException('horario no existe');
        }
        try {
            return await this.repository.update(id,body);
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
    async deleteByCampain(id:number){
        const campain = await this.findByCampingId(id);
        if(!campain){
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
    return Object.values(DiaSemana)
      .filter((value) => typeof value === 'number')  
      .map((num: number) => ({
        number: num,
        name: DiaSemana[num],
      }));
  }
}
