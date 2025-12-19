import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DashboardReportRepository } from './repositories/dashboard-report.repository';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { BaseResponseDto } from '@common/dto/base-response.dto';
import { User } from '@modules/user/entities/user.entity';
import { DashboardReport } from './entities/dashboard-report.entity';
import { UpdateDashboardReportDto } from './dto/update-dashboard-report.dto';
import { CreateDashboardReportDto } from './dto/create-dashboard-report.dto';
import { col, fn, Order, where } from 'sequelize';
import { Op } from 'sequelize';

/**
 * Service layer for managing Dashboard Reports (Widgets).
 *
 * Handles CRUD operations, pagination, status toggling,
 * soft delete and restoration. Delegates persistence logic
 * to the DashboardReportRepository.
 */
@Injectable()
export class DashboardReportService {
  constructor(private readonly repository: DashboardReportRepository) {}

  /**
   * Retrieves paginated reports for the current user.
   * @param user Current authenticated user
   * @param limit Pagination limit
   * @param offset Pagination offset
   * @returns PaginatedResponse containing reports
   */
  async findAll(
    user: User,
    limit: number,
    offset: number,
    q?: Record<string, any>,
  ): Promise<PaginatedResponse<DashboardReport>> {
    try {
      const { orderField, searchText = '' } = q || {};
      const searchTerm = searchText.toLowerCase();
      const whereOptions: any = {};
      if (searchTerm) {
        const safeTerm = searchTerm.replace(/'/g, "''"); // prevenir inyección SQL
        whereOptions[Op.or] = [
          where(fn('LOWER', col('DashboardReport.name')), {
            [Op.like]: `%${safeTerm}%`,
          }),
        ];
      }
      const order: Order = orderField
        ? [[orderField.field, orderField.order]]
        : [['id', 'DESC']];

      return this.repository.findAndCountAll({
        where: whereOptions,
        limit,
        offset,
        order,
      });
    } catch (error) {
      console.error('Error in DashboardReportService.findAll:', error);
      throw new InternalServerErrorException(
        'Error al obtener los reportes del dashboard',
      );
    }
  }

  /**
   * Finds a report by ID.
   * @param id Report identifier
   * @returns The report entity
   * @throws NotFoundException if not found
   */
  async findOne(id: number): Promise<DashboardReport> {
    try {
      const exist = await this.repository.findById(id);

      if (!exist) {
        throw new NotFoundException('Reporte no encontrado');
      }

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  /**
   * Creates a new report.
   * @param dto Report data
   * @param createdBy Optional user identifier
   * @returns The created report entity
   */
  async create(
    dto: CreateDashboardReportDto,
    createdBy: number | null = null,
  ): Promise<DashboardReport> {
    try {
      const report = await this.repository.create({
        ...dto,
      });

      return report;
    } catch (error) {
      console.log('Error creating Dashboard Report:', error);
      throw new InternalServerErrorException(
        error,
        'Error al crear el reporte',
      );
    }
  }

  /**
   * Updates a report by ID.
   * @param id Report identifier
   * @param dto Updated data
   * @returns The updated report
   */
  async update(
    id: number,
    dto: UpdateDashboardReportDto,
  ): Promise<DashboardReport> {
    try {
      const exist = await this.repository.findById(id);

      if (!exist) {
        throw new NotFoundException('Reporte no encontrado');
      }

      await exist.update(dto);

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  /**
   * Toggles report status between active / inactive.
   * @param id Report identifier
   * @returns Updated report entity
   */
  async toggleStatus(id: number): Promise<DashboardReport> {
    try {
      const exist = await this.repository.findById(id);

      if (!exist) {
        throw new NotFoundException('Reporte no encontrado');
      }

      const newStatus = !exist.get().status;

      await exist.update({ status: newStatus });

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  /**
   * Deletes (soft delete) a report.
   * @param id Report identifier
   */
  async remove(id: number): Promise<void> {
    try {
      return this.repository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error al eliminar el reporte',
      );
    }
  }

  /**
   * Restores a previously soft-deleted report.
   * @param id Report identifier
   */
  async restore(id: number): Promise<void> {
    try {
      return this.repository.restore(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error al restaurar el reporte',
      );
    }
  }
}
