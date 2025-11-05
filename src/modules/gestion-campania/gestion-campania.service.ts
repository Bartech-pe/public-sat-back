import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateGestionCampaniaDto } from './dto/create-gestion-campania.dto';
import { UpdateGestionCampaniaDto } from './dto/update-gestion-campania.dto';
import { GestionCampaniaRepository } from './repositories/gestion-campania.repository';
import { GestionCampaniaResponse } from './entities/gestion-campania.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { InjectModel } from '@nestjs/sequelize';
import { TipoCampaniaResponse } from '@modules/tipo-campania/entities/tipo-campania.entity';
import { AreaCampaniaResponse } from '@modules/area-campania/entities/area-campania.entity';
import { EstadoCampania } from '@modules/estado-campania/entities/estado-campania.entity';
import { User } from '@modules/user/entities/user.entity';
import { HorarioService } from '@modules/horario/service/horario.service';
import { CreateHorario } from '@modules/horario/dto/horario/create-horario.dto';
import { TipoCampaniaRepository } from '@modules/tipo-campania/repositories/tipo-campania.repository';
import * as XLSX from 'xlsx';
import { SmsChannelService } from './sms-channel.service';
import { SmsMessageChannel } from './dto/sms-message.dto';

@Injectable()
export class GestionCampaniaService {
     constructor(
      @InjectModel(GestionCampaniaResponse)
      private readonly campaniaModel: typeof GestionCampaniaResponse,
      private readonly repository: GestionCampaniaRepository,
      private readonly campaingTypeRepository:TipoCampaniaRepository,
      private readonly horario:HorarioService,) {}
     
       async findAll(
         limit: number,
         offset: number,
       ): Promise<PaginatedResponse<GestionCampaniaResponse>> {
         try {
           return this.repository.findAndCountAll({
             limit,
             offset,
             order: [['id', 'DESC']],
           });
         } catch (error) {
           throw new InternalServerErrorException(
             error,
             'Error interno del servidor',
           );
         }
       }

      async findByallCampania(): Promise<GestionCampaniaResponse[]> {
        try {
          const detalles = await this.campaniaModel.findAll({
            include: [
              { model: TipoCampaniaResponse, as: 'tipoCampania' },
              { model: AreaCampaniaResponse, as: 'areaCampania' },
              { model: EstadoCampania, as: 'estados' },
              { model: User, as: 'user' },
            ],
          });

          return detalles;
        } catch (error) {
          console.error('Error al obtener campañas:', error);

          // Lanza una excepción personalizada o una genérica según tu necesidad
          throw new InternalServerErrorException('No se pudieron obtener las campañas');
        }
      }

      //  async findByallCampania(): Promise<GestionCampaniaResponse[]> {
      //      const detalles = await this.campaniaModel.findAll({
      //        include: [
      //          {
      //            model: TipoCampaniaResponse,
      //            as: 'tipoCampania',
      //          },
      //          {
      //            model: AreaCampaniaResponse,
      //            as: 'areaCampania',
      //          },
      //          {
      //            model: EstadoCampania,
      //            as: 'estados',
      //          },
      //          {
      //            model: User,
      //            as: 'user',
      //          },
      //        ],
      //      });
       
      //      // Si no hay resultados, se retorna un array vacío (detalles será [])
      //      return detalles;
      //   }
     
       async findOne(id: number): Promise<GestionCampaniaResponse> {
          try {
            const exist = await this.repository.findById(id);
            if (!exist) {
              throw new NotFoundException('Campaña no encontrado');
            }
            return exist;
          } catch (error) {
            throw new InternalServerErrorException(
              error,
              'Error interno del servidor',
            );
          }
       }
     
       async create(dto: CreateGestionCampaniaDto): Promise<GestionCampaniaResponse> {
         try {
           const creation={
             nombre: dto.nombre,
             descripcion: dto.descripcion,
             id_tipo_campania: dto.id_tipo_campania,
             id_area_campania: dto.id_area_campania,
             id_estado_campania: dto.id_estado_campania,
             createUser: dto.createUser,
             fecha_inicio: dto.fecha_inicio,
             fecha_fin: dto.fecha_fin,
             fecha_vigencia: dto.fecha_vigencia,
             campaniaId:dto.campaniaId,
           }
           const ready = await this.repository.create(creation);
           if(dto.campaniaId){
              const time:CreateHorario={
                hora_inicio: dto.horario_inicio,
                hora_fin: dto.horario_fin,
                dia_inicio: dto.dia_inicio ?? 0,
                dia_fin: dto.dia_fin ?? 0,
                feriado: dto.feriado ?? false,
                gestion_campania_id:ready.toJSON().id
              }
              await this.horario.create(time);
           }
           return ready;
         } catch (error) {
           throw new InternalServerErrorException(
             error,
             'Error interno del servidor',
           );
         }
       }
     
       async bulkCreate(
         dtoList: CreateGestionCampaniaDto[],
       ): Promise<GestionCampaniaResponse[]> {
         try {
           const securedDtoList = await Promise.all(
             dtoList.map(async (dto) => ({
               ...dto,
             })),
           );
           return this.repository.bulkCreate(securedDtoList, {});
         } catch (error) {
           throw new InternalServerErrorException(
             error,
             'Error interno del servidor',
           );
         }
       }
     
       async update(
         id: number,
         dto: UpdateGestionCampaniaDto,
       ): Promise<GestionCampaniaResponse> {
         try {
           const exist = await this.repository.findById(id);
     
           await exist.update(dto);
           
           return exist;
         } catch (error) {
           throw new InternalServerErrorException(
             error,
             'Error interno del servidor',
           );
         }
       }
     
       async toggleGestionCampaniaResponse(id: number): Promise<GestionCampaniaResponse> {
         try {
           const exist = await this.repository.findById(id);
     
           const status = !exist.get().status;
     
           exist.update({ status });
     
           return exist;
         } catch (error) {
           throw new InternalServerErrorException(
             error,
             'Error interno del servidor',
           );
         }
       }
     
       remove(id: number): Promise<void> {
         try {
           return this.repository.delete(id);
         } catch (error) {
           throw new InternalServerErrorException(
             error,
             'Error interno del servidor',
           );
         }
       }
     
       restore(id: number): Promise<void> {
         try {
           return this.repository.restore(id);
         } catch (error) {
           throw new InternalServerErrorException(
             error,
             'Error interno del servidor',
           );
         }
       }
 

}
