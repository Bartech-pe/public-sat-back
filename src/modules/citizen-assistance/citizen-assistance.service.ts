import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { Department } from '@modules/department/entities/department.entity';
import { User } from '@modules/user/entities/user.entity';
import { CitizenAssistanceRepository } from './repositories/citizen-assistance.repository';
import { CitizenAssistance } from './entities/citizen-assistance.entity';
import { CreateCitizenAssistanceDto } from './dto/create-citizen-assistance.dto';
import { UpdateCitizenAssistanceDto } from './dto/update-citizen-assistance.dto';
import { PortfolioDetailRepository } from '@modules/portfolio-detail/repositories/portfolio-detail.repository';
import { Office } from '@modules/office/entities/office.entity';
import { PortfolioDetail } from '@modules/portfolio-detail/entities/portfolio-detail.entity';
import { Portfolio } from '@modules/portfolio/entities/portfolio.entity';
import { roleIdAdministrador } from '@common/constants/role.constant';

@Injectable()
export class CitizenAssistanceService {
  constructor(
    private readonly repository: CitizenAssistanceRepository,
    private readonly carteraDetalleRepository: PortfolioDetailRepository,
  ) {}

  async findAll(
    user: User,
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<CitizenAssistance>> {
    try {
      const whereOpts =
        user.roleId == roleIdAdministrador
          ? {
              where: {
                status: true,
              },
            }
          : {
              where: {
                status: true,
              },
            };
      return this.repository.findAndCountAll({
        ...whereOpts,
        include: [
          {
            model: PortfolioDetail,
            include: [
              { model: Portfolio, include: [{ model: Office }] },
              {
                model: User,
                as: 'user',
              },
            ],
          },
          { model: User, as: 'createdByUser' },
        ],
        limit,
        offset,
        order: [['id', 'DESC']],
      });
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async findOne(id: number): Promise<CitizenAssistance> {
    try {
      const exist = await this.repository.findOne({
        where: { id },
      });
      if (!exist) {
        throw new NotFoundException('Registro no encontrado');
      }
      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  findByPortfolioDetail(
    portfolioDetailId: number,
  ): Promise<CitizenAssistance[]> {
    try {
      return this.repository.findAll({
        where: { portfolioDetailId, verifyPayment: false },
        include: [{ model: User, as: 'createdByUser' }],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  findVerificacionByPortfolioDetail(
    portfolioDetailId: number,
  ): Promise<CitizenAssistance[]> {
    try {
      return this.repository.findAll({
        where: { portfolioDetailId, verifyPayment: true },
        include: [{ model: User, as: 'createdByUser' }],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  findByDocIde(docIde: string): Promise<CitizenAssistance[]> {
    try {
      return this.repository.findAll({
        where: { docIde },
        include: [{ model: User, as: 'createdByUser' }],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async create(dto: CreateCitizenAssistanceDto): Promise<CitizenAssistance> {
    try {
      const attention = this.repository.create(dto);
      if (dto.portfolioDetailId) {
        const carteraDetalle = await this.carteraDetalleRepository.findById(
          dto.portfolioDetailId,
        );
        if (!carteraDetalle.dataValues.status) {
          await this.carteraDetalleRepository.update(dto.portfolioDetailId, {
            status: true,
            updatedAt: new Date(),
          });
        }
      }

      return attention;
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(
    dtoList: CreateCitizenAssistanceDto[],
  ): Promise<CitizenAssistance[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (dto) => {
          return dto;
        }),
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
    dto: UpdateCitizenAssistanceDto,
  ): Promise<CitizenAssistance> {
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

  async toggleStatus(id: number): Promise<CitizenAssistance> {
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
