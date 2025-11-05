import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { GestionCampaniaService } from './gestion-campania.service';
import { CreateGestionCampaniaDto } from './dto/create-gestion-campania.dto';
import { UpdateGestionCampaniaDto } from './dto/update-gestion-campania.dto';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { GestionCampaniaResponse } from './entities/gestion-campania.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { SmsMessageChannel } from './dto/sms-message.dto';

@Controller('gestion-campania')
export class GestionCampaniaController {
  constructor(private readonly service: GestionCampaniaService) {}

    @Get()
    findAll(@Query() query: PaginationQueryDto): Promise<PaginatedResponse<GestionCampaniaResponse>> {
       const limit = query.limit!;
       const offset = query.offset!;
      return this.service.findAll(limit, offset);
    }

    @Get('all')
    findByCartera(): Promise<GestionCampaniaResponse[]> {
          return this.service.findByallCampania();
    }
   
    @Get(':id')
    findOne(@Param('id') id: number): Promise<GestionCampaniaResponse> {
       return this.service.findOne(+id);
    }
   
    @Post()
    create(
       @Body() dto: CreateGestionCampaniaDto,
    ): Promise<GestionCampaniaResponse> {
       return this.service.create(dto);
     }
   
    @Patch(':id')
    update(
       @Param('id') id: number,
       @Body() dto: UpdateGestionCampaniaDto,
     ): Promise<GestionCampaniaResponse> {
       return this.service.update(+id, dto);
    }
   
    @Put('toggleGestionCampaniaResponse/:id')
     toggleGestionCampaniaResponse(
       @Param('id') id: number,
     ): Promise<GestionCampaniaResponse> {
       return this.service.toggleGestionCampaniaResponse(id);
    }
   
    @Delete(':id')
     remove(@Param('id') id: number) {
       return this.service.remove(+id);
    }
    
    
}
