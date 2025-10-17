import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PortfolioDetailRepository } from './repositories/portfolio-detail.repository';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { PortfolioDetail } from './entities/portfolio-detail.entity';
import { User } from '@modules/user/entities/user.entity';
import { CreatePortfolioDetailDto } from './dto/create-portfolio-detail.dto';
import { UpdatePortfolioDetailDto } from './dto/update-portfolio-detail.dto';
import { ReasignPortfolioDetailDto } from './dto/reasign-portfolio-detail.dto';
import { CaseInformation } from './entities/case-information.entity';
import { CaseInformationDto } from './dto/case-information.dto';
import { CaseInformationRepository } from './repositories/case-information.repository';
import { Portfolio } from '@modules/portfolio/entities/portfolio.entity';
import { PortfolioAssignmentRepository } from './repositories/portfolio-assignment.repository';
import { CreatePortfolioAssignmentDto } from './dto/create-portfolio-assignment.dto';
import { col, Op } from 'sequelize';
import { PortfolioAssignment } from './entities/portfolio-assignment.entity';
import { CitizenContact } from '../citizen/entities/citizen-contact.entity';
import { CitizenContactDto } from '../citizen/dto/citizen-contact.dto';
import { CitizenContactRepository } from '@modules/citizen/repositories/citizen-contact.repository';

@Injectable()
export class PortfolioDetailService {
  constructor(
    private readonly repository: PortfolioDetailRepository,
    private readonly infoCasoRepository: CaseInformationRepository,
    private readonly portfolioAssignmentRepository: PortfolioAssignmentRepository,
    private readonly citizenContactRepository: CitizenContactRepository,
  ) {}

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<PortfolioDetail>> {
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

  async findByPortfolioId(portfolioId: number): Promise<PortfolioDetail[]> {
    const detalles = await this.repository.findAll({
      where: { portfolioId: portfolioId },
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (!detalles.length) {
      throw new NotFoundException(
        `No se encontraron detalles para la cartera ${portfolioId}`,
      );
    }

    return detalles;
  }

  findByUserId(
    userId: number,
    portfolioId: number,
  ): Promise<PortfolioDetail[]> {
    return this.repository.findAll({
      where: { userId, portfolioId },
      include: [
        {
          model: Portfolio,
          required: true,
        },
        {
          model: User,
          as: 'user',
        },
        { model: CaseInformation },
        {
          model: CitizenContact,
          as: 'citizenContacts',
          required: false,
          separate: true,
          on: {
            '$citizenContacts.tip_doc$': {
              [Op.eq]: col('PortfolioDetail.tip_doc'),
            },
            '$citizenContacts.doc_ide$': {
              [Op.eq]: col('PortfolioDetail.doc_ide'),
            },
          },
          order: [['created_at', 'ASC']],
        },
      ],
    });
  }

  async findOne(id: number): Promise<PortfolioDetail> {
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

  async create(dto: CreatePortfolioDetailDto): Promise<PortfolioDetail> {
    try {
      const { citizenContacts, ...d } = dto;
      return this.repository.create(d);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async createOrUpdateInfoCaso(
    idDetalle: number,
    dto: CaseInformationDto,
  ): Promise<CaseInformation> {
    try {
      const exist = await this.repository.findOne({
        where: { id: idDetalle },
        include: [{ model: CaseInformation, required: true }],
      });
      if (exist?.get()) {
        return exist?.get().informacionCaso?.update(dto);
      }
      return this.infoCasoRepository.create(dto);
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(
    dtoList: CreatePortfolioDetailDto[],
  ): Promise<PortfolioDetail[]> {
    try {
      const securedDtoList = await Promise.all(
        dtoList.map(async (item) => {
          const { citizenContacts, ...d } = item;
          return d;
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
    dto: UpdatePortfolioDetailDto,
  ): Promise<PortfolioDetail> {
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

  async togglePortfolioDetail(id: number): Promise<PortfolioDetail> {
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

  async reasigUser(
    dtoList: ReasignPortfolioDetailDto[],
  ): Promise<PortfolioDetail[]> {
    try {
      const resultados: PortfolioDetail[] = [];

      for (const dto of dtoList) {
        const [affectedRows, [updatedRow]] = await this.repository.update(
          dto.id,
          { userId: dto.userId },
        );

        if (updatedRow) {
          resultados.push(updatedRow);
        }
      }

      return resultados;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async createMultiple(detalles: Partial<CreatePortfolioAssignmentDto>[]) {
    try {
      // Extraemos todas las combinaciones de id_cartera_detalle e id_user del array recibido
      const condiciones = detalles.map((d) => ({
        portfolioDetailId: d.portfolioDetailId,
        userId: d.userId,
      }));

      // Buscamos los que ya existen
      const existentes = await this.portfolioAssignmentRepository.findAll({
        where: {
          [Op.or]: condiciones,
        },
        attributes: ['portfolioDetailId', 'userId'],
        raw: true,
      });

      // Creamos un Set de las combinaciones existentes para fácil comparación
      const existentesSet = new Set(
        existentes.map((e) => `${e.portfolioDetailId}-${e.userId}`),
      );

      // Filtramos solo los que NO existen
      const nuevos = detalles.filter(
        (d) => !existentesSet.has(`${d.portfolioDetailId}-${d.userId}`),
      );

      // Si no hay nuevos, devolvemos mensaje
      if (!nuevos.length) {
        return {
          message: 'No hay nuevos detalles por asignar. Todos ya existen.',
          count: 0,
          data: [],
        };
      }

      // Registramos solo los nuevos
      const result = await this.portfolioAssignmentRepository.bulkCreate(
        nuevos,
        {
          validate: true,
          returning: true,
        },
      );

      //actualizar en el carteraDetalleModel

      await Promise.all(
        nuevos.map(async (element) => {
          const actualizar = await this.repository.findOne({
            where: { id: element.portfolioDetailId },
          });

          if (actualizar) {
            await actualizar.update({
              userId: element.userId,
            });
          }
        }),
      );

      return {
        message: 'Detalles asignados correctamente',
        count: result.length,
        data: result,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error al guardar los detalles de la cartera.',
      );
    }
  }

  async findAssignmentByUserId(userId: number): Promise<PortfolioAssignment[]> {
    const detalles = await this.portfolioAssignmentRepository.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'userPrev',
        },
        {
          model: User,
          as: 'user',
        },
      ],
    });

    // Si no hay resultados, se retorna un array vacío (detalles será [])
    return detalles;
  }

  async findAssignmentByPortfolioId(
    userId: number,
  ): Promise<PortfolioAssignment[]> {
    const detalles = await this.portfolioAssignmentRepository.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: 'userPrev',
        },
        {
          model: User,
          as: 'user',
        },
      ],
    });

    // Si no hay resultados, se retorna un array vacío (detalles será [])
    return detalles;
  }
}
