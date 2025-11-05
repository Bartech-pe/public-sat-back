import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTipoCampaniaDto } from './dto/create-tipo-campania.dto';
import { UpdateTipoCampaniaDto } from './dto/update-tipo-campania.dto';
import { TipoCampaniaResponse } from './entities/tipo-campania.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { TipoCampaniaRepository } from './repositories/tipo-campania.repository';

@Injectable()
export class TipoCampaniaService {
 constructor(private readonly repository: TipoCampaniaRepository) {}
   
     async findAll(
       limit: number,
       offset: number,
     ): Promise<PaginatedResponse<TipoCampaniaResponse>> {
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
   
     async findOne(id: number): Promise<TipoCampaniaResponse> {
       try {
         const exist = await this.repository.findById(id);
         if (!exist) {
           throw new NotFoundException('Usuario no encontrado');
         }
         return exist;
       } catch (error) {
         throw new InternalServerErrorException(
           error,
           'Error interno del servidor',
         );
       }
     }
   
     async create(dto: CreateTipoCampaniaDto): Promise<TipoCampaniaResponse> {
       try {
         return this.repository.create(dto);
       } catch (error) {
         throw new InternalServerErrorException(
           error,
           'Error interno del servidor',
         );
       }
     }
   
     async bulkCreate(
       dtoList: CreateTipoCampaniaDto[],
     ): Promise<TipoCampaniaResponse[]> {
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
       dto: UpdateTipoCampaniaDto,
     ): Promise<TipoCampaniaResponse> {
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
   
     async toggleTipoCampaniaResponse(id: number): Promise<TipoCampaniaResponse> {
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
