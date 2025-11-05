import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put
} from '@nestjs/common';
import { SurveyService } from './survey.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { User } from '@modules/user/entities/user.entity';
import { PaginationQueryDto } from '@common/dto/pagination-query.dto';
import { Survey } from './entities/survey.entity';
@Controller('survey')
export class SurveyController {
      
      constructor(private readonly service: SurveyService) {}

      @Get()
      findAll(
      @CurrentUser() user: User,
      @Query() query: PaginationQueryDto,
      ): Promise<PaginatedResponse<Survey>> {
        const limit = query.limit!;
        const offset = query.offset!;
        return this.service.findAll(user, limit, offset);
      }

      @Get(':id')
      findOne(@Param('id') id: number): Promise<Survey> {
        return this.service.findOne(+id);
      }

      @Post()
      create(@Body() dto: CreateSurveyDto): Promise<Survey> {
        return this.service.create(dto);
      }

      @Patch(':id')
      update(@Param('id') id: number, @Body() dto: UpdateSurveyDto): Promise<Survey> {
        return this.service.update(+id, dto);
      }

      @Put('toggleStatus/:id')
      toggleStatus(@Param('id') id: number): Promise<Survey> {
        return this.service.toggleStatus(id);
      }

      @Delete(':id')
      remove(@Param('id') id: number) {
        return this.service.remove(+id);
      }
}
