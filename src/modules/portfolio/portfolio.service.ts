import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioRepository } from './repositories/portfolio.repository';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { User } from '@modules/user/entities/user.entity';
import { Office } from '@modules/office/entities/office.entity';
import { PortfolioDetail } from '@modules/portfolio-detail/entities/portfolio-detail.entity';
import { CitizenContactRepository } from '@modules/portfolio-detail/repositories/citizen-contact.repository';
import { col, Op } from 'sequelize';
import { CitizenContact } from '@modules/portfolio-detail/entities/citizen-contact.entity';
import { CitizenRepository } from '@modules/citizen/repositories/citizen.repository';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly repository: PortfolioRepository,
    private readonly cityzenRepository: CitizenRepository,
    private readonly citizenContactRepository: CitizenContactRepository,
  ) {}

  ///private readonly PortfolioDetailRepository: PortfolioDetailRepository

  async findAll(
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Portfolio>> {
    try {
      return this.repository.findAndCountAll({
        include: [{ model: Office }, { model: User, as: 'createdByUser' }],
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

  async findOne(id: number): Promise<Portfolio> {
    try {
      const exist = await this.repository.findOne({
        where: { id },
        include: [
          { model: Office },
          { model: User, as: 'createdByUser' },
          {
            model: PortfolioDetail,
            include: [
              { model: User, as: 'user' },
              {
                model: CitizenContact,
                as: 'citizenContacts',
                required: false,
                separate: true,
                where: { status: true },
                on: {
                  // 👇 referenciamos columnas con Sequelize.col
                  '$detalles.tip_doc$': {
                    [Op.eq]: col('detalles->citizenContacts.tip_doc'),
                  },
                  '$detalles.doc_ide$': {
                    [Op.eq]: col('detalles->citizenContacts.doc_ide'),
                  },
                },
                order: [['created_at', 'ASC']],
              },
            ],
          },
        ],
      });
      if (!exist) {
        throw new NotFoundException('Usuario no encontrado');
      }
      return exist;
    } catch (error) {
      console.log('error', error);
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async create(dto: CreatePortfolioDto): Promise<Portfolio> {
    try {
      // 1. Crear la cartera (sin detalles)
      const { detalles, ...restoDto } = dto;

      const citizenContactList = detalles.flatMap(
        (det) => det.citizenContacts ?? [],
      );

      // Eliminamos duplicados dentro del propio array (opcional pero recomendado)
      const uniqueContacts = citizenContactList.filter(
        (contact, index, self) =>
          index ===
          self.findIndex(
            (c) =>
              c.tipDoc === contact.tipDoc &&
              c.docIde === contact.docIde &&
              c.contactType === contact.contactType &&
              c.value === contact.value,
          ),
      );
      // Buscamos en BD cuáles ya existen
      const existingContacts = await this.citizenContactRepository.findAll({
        where: {
          [Op.or]: uniqueContacts.map((c) => ({
            tipDoc: c.tipDoc,
            docIde: c.docIde,
            contactType: c.contactType,
            value: c.value,
          })),
        },
      });

      // Armamos un set para búsqueda rápida
      const existingSet = new Set(
        existingContacts.map(
          (c) => `${c.tipDoc}-${c.docIde}-${c.contactType}-${c.value}`,
        ),
      );

      // Filtramos los que NO existen
      const contactsToCreate = uniqueContacts.filter(
        (c) =>
          !existingSet.has(
            `${c.tipDoc}-${c.docIde}-${c.contactType}-${c.value}`,
          ),
      );

      // Insertamos solo los que faltan
      if (contactsToCreate.length > 0) {
        await this.citizenContactRepository.bulkCreate(contactsToCreate);
      }

      // Eliminamos los ciudadanos duplicados dentro del propio array (opcional pero recomendado)
      const uniqueCitizen = detalles.filter(
        (contact, index, self) =>
          index ===
          self.findIndex(
            (c) =>
              c.tipDoc === contact.tipDoc &&
              c.docIde === contact.docIde &&
              c.taxpayerName === contact.taxpayerName,
          ),
      );

      if (uniqueCitizen.length !== 0) {
        await this.cityzenRepository.bulkCreate(
          uniqueCitizen.map((cit) => ({
            tipDoc: cit.tipDoc,
            docIde: cit.docIde,
            name: cit.taxpayerName,
          })),
          {
            updateOnDuplicate: ['name'],
          },
        );
      }

      return this.repository.create(
        {
          ...restoDto,
          detalles: detalles.map((det) => {
            const { citizenContacts, ...d } = det;
            return { ...d, currentDebt: d.debt } as PortfolioDetail;
          }),
        },
        {
          include: [
            {
              model: PortfolioDetail,
            },
          ],
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async bulkCreate(dtoList: Partial<Portfolio>[]): Promise<Portfolio[]> {
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

  async update(id: number, dto: UpdatePortfolioDto): Promise<Portfolio> {
    try {
      const exist = await this.repository.findById(id);

      await exist.update(dto);

      // --- Lógica de citizenContacts ---
      if (dto.detalles && Array.isArray(dto.detalles)) {
        // 1. Extraemos todos los contactos
        const citizenContactList = dto.detalles.flatMap(
          (det) => det.citizenContacts ?? [],
        );

        // 2. Quitamos duplicados en memoria
        const uniqueContacts = citizenContactList.filter(
          (contact, index, self) =>
            index ===
            self.findIndex(
              (c) =>
                c.tipDoc === contact.tipDoc &&
                c.docIde === contact.docIde &&
                c.contactType === contact.contactType &&
                c.value === contact.value,
            ),
        );

        // 3. Revisamos cuáles ya existen en BD
        const existingContacts = await this.citizenContactRepository.findAll({
          where: {
            [Op.or]: uniqueContacts.map((c) => ({
              tipDoc: c.tipDoc,
              docIde: c.docIde,
              contactType: c.contactType,
              value: c.value,
            })),
          },
        });

        // 4. Armamos set para lookup rápido
        const existingSet = new Set(
          existingContacts.map(
            (c) => `${c.tipDoc}-${c.docIde}-${c.contactType}-${c.value}`,
          ),
        );

        // 5. Filtramos solo los que faltan
        const contactsToCreate = uniqueContacts.filter(
          (c) =>
            !existingSet.has(
              `${c.tipDoc}-${c.docIde}-${c.contactType}-${c.value}`,
            ),
        );

        // 6. Insertamos en bloque
        if (contactsToCreate.length > 0) {
          await this.citizenContactRepository.bulkCreate(contactsToCreate);
        }

        // --- Lógica de detalles ---
        for (const d of dto.detalles) {
          if (d.statusCase === 'new') {
            await PortfolioDetail.create({
              idPortfolio: id,
              ...d,
              currentDebt: d.debt,
            });
          }
          // Aquí puedes manejar casos update/delete si aplica
        }

        // Eliminamos los ciudadanos duplicados dentro del propio array (opcional pero recomendado)
        const uniqueCitizen = dto.detalles.filter(
          (contact, index, self) =>
            index ===
            self.findIndex(
              (c) =>
                c.tipDoc === contact.tipDoc &&
                c.docIde === contact.docIde &&
                c.taxpayerName === contact.taxpayerName,
            ),
        );

        if (uniqueCitizen.length !== 0) {
          await this.cityzenRepository.bulkCreate(
            uniqueCitizen.map((cit) => ({
              tipDoc: cit.tipDoc,
              docIde: cit.docIde,
              name: cit.taxpayerName,
            })),
            {
              updateOnDuplicate: ['name'],
            },
          );
        }
      }

      return exist;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async toggleStatus(id: number): Promise<Portfolio> {
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
