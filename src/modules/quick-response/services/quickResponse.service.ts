import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { QuickResponse } from '../entities/quick-response.entity';
import { InjectModel } from '@nestjs/sequelize';
import { QuickResponseFilter } from '../dto/quick-response-filter.dto';
import { QuickResponseCategory } from '../entities/quick-response-category.entity';
import { CreateQuickResponseDto } from '../dto/create-quick-response.dto';
import { UpdateQuickResponseDto } from '../dto/update-quick-response.dto';
import { Op } from 'sequelize';

@Injectable()
export class QuickResponseService {
  @InjectModel(QuickResponse)
  private readonly quickResponseRepository: typeof QuickResponse;
  async findAll(filter: QuickResponseFilter): Promise<any[]> {
    const where: any = {};

    if (filter.categoryId !== undefined) {
      where.quickResponseCategoryId = filter.categoryId;
    }

    if (filter.status !== undefined) {
      where.status = filter.status;
    }
    if (filter.search) {
      where.title = { [Op.like]: `%${filter.search}%` };
    }
    const orderBy = filter.orderby ?? 'createdAt';
    const sequelize = this.quickResponseRepository.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize instance not available');
    }
    const data = await this.quickResponseRepository.findAll({
      attributes: ['id', 'title', 'content', 'status', 'keywords', 'createdAt'],
      where,
      order: [[orderBy, 'ASC']],
      include: [
        {
          model: QuickResponseCategory,
          attributes: ['id', 'name'],
        },
      ],
    });
    const response = data.map((item) => ({
      ...item.toJSON(),
      createdAt: new Date(item.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    }));
    return response;
  }
  async createQuickResponse(body: CreateQuickResponseDto) {
    const created = await this.quickResponseRepository.create({ ...body });
    if (!created) {
      Logger.error(`Quick Response could not be created`);
      throw new NotFoundException('could not be created');
    }
    return {
      message: 'Quick Response  created successfully',
      isSuccess: true,
    };
  }
  async updateQuickResponse(id: number, body: UpdateQuickResponseDto) {
    const [affectedRows] = await this.quickResponseRepository.update(body, {
      where: { id: id },
    });
    if (affectedRows === 0) {
      Logger.error(`Quick Response with id ${id} not found`);
      throw new NotFoundException(`Quick Response with id ${id} not found`);
    }
    return {
      message: 'Quick Response updated successfully',
      isSuccess: true,
    };
  }
  async deleteQuickResponse(id: number) {
    await this.quickResponseRepository.destroy({
      where: { id: id },
    });
    return {
      message: 'Quick Response deleted successfully',
      isSuccess: true,
    };
  }
}
