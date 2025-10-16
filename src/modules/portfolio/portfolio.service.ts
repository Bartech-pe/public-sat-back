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
import { col, Op } from 'sequelize';
import { CitizenContact } from '@modules/citizen/entities/citizen-contact.entity';
import { CitizenRepository } from '@modules/citizen/repositories/citizen.repository';
import { CitizenContactRepository } from '@modules/citizen/repositories/citizen-contact.repository';
import * as XLSX from 'xlsx';
import { UserRepository } from '@modules/user/repositories/user.repository';
import { PortfolioDetailRepository } from '@modules/portfolio-detail/repositories/portfolio-detail.repository';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PortfolioGateway } from './portfolio.gateway';
@Injectable()
export class PortfolioService {
  constructor(
    private readonly repository: PortfolioRepository,
    private readonly cityzenRepository: CitizenRepository,
    private readonly citizenContactRepository: CitizenContactRepository,
    private readonly userRepository: UserRepository,

    private readonly repositoryDetail: PortfolioDetailRepository,
    @InjectQueue('portfolio-detail-queue')
    private readonly portfolioQueue: Queue,
    private readonly gateway: PortfolioGateway,
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

  getCitizenContacts(row: any): CitizenContact[] {
    const tipDoc = row['TIPO DOC. IDE.'];
    const docIde = row['N° DOC. IDE.'];
    const email =
      typeof row['EMAIL'] === 'object' && row['EMAIL']
        ? row['EMAIL'].text || row['EMAIL'].email || undefined
        : row['EMAIL'] || undefined;
    const phone1 = row['TELEFONO 1'];
    const phone2 = row['TELEFONO 2'];
    const phone3 = row['TELEFONO 3'];
    const phone4 = row['TELEFONO 4'];
    const whatsapp = row['WHATSAPP'];
    return [
      {
        tipDoc: tipDoc,
        docIde: docIde,
        contactType: 'PHONE',
        isAdditional: false,
        value: phone1,
        status: true,
      },
      {
        tipDoc: tipDoc,
        docIde: docIde,
        contactType: 'PHONE',
        isAdditional: false,
        value: phone2,
        status: true,
      },
      {
        tipDoc: tipDoc,
        docIde: docIde,
        contactType: 'PHONE',
        isAdditional: false,
        value: phone3,
        status: true,
      },
      {
        tipDoc: tipDoc,
        docIde: docIde,
        contactType: 'PHONE',
        isAdditional: false,
        value: phone4,
        status: true,
      },
      {
        tipDoc: tipDoc,
        docIde: docIde,
        contactType: 'EMAIL',
        isAdditional: false,
        value: email,
        status: true,
      },
      {
        tipDoc: tipDoc,
        docIde: docIde,
        contactType: 'WHATSAPP',
        isAdditional: false,
        value: whatsapp,
        status: true,
      },
    ]
      .map((item) => item as CitizenContact)
      .filter((item) => !!item.value);
  }

  async create(
    dto: Omit<CreatePortfolioDto, 'file'>,
    file: Express.Multer.File,
  ): Promise<Portfolio> {
    try {
      if (!file) {
        throw new BadRequestException('Debe subir un archivo Excel.');
      }

      // Leer el archivo Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const listUsers = (await this.userRepository.findAll()).map((item) =>
        item.toJSON(),
      );

      if (!data.length) {
        throw new BadRequestException('El archivo Excel está vacío.');
      }

      // Mapeo de datos
      const data_detalles: PortfolioDetail[] = data
        .map((item): PortfolioDetail => {
          // Obtener contactos del ciudadano
          const citizenContacts: CitizenContact[] =
            this.getCitizenContacts(item);
          const user = listUsers.find(
            (u) =>
              u.name?.trim().toLowerCase() ==
              item['SECTORISTA']?.trim().toLowerCase(),
          );
          return {
            userId: user?.id,
            segment: item['SEGMENTO'],
            profile: item['PERFIL'],
            taxpayerName: item['CONTRIBUYENTE'],
            taxpayerType: item['TIPO DE CONTRIBUYENTE'],
            tipDoc: item['TIPO DOC. IDE.'],
            docIde: String(item['N° DOC. IDE.']),
            code: String(item['CODIGO DE CONTRIBUYENTE']),
            debt: parseFloat(item['DEUDA']),
            currentDebt: parseFloat(item['DEUDA']),
            citizenContacts,
          } as PortfolioDetail;
        })
        .filter((fil) => fil.userId);

      const result = await this.repository.create({ ...dto });

      await this.portfolioQueue.add('register-details', {
        portfolioId: result.id,
        detalles: data_detalles,
      });

      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        error,
        'Error interno del servidor',
      );
    }
  }

  async savePortfolioDetails(
    portfolioId: number,
    detallesComplete: PortfolioDetail[],
  ) {
    const BATCH_SIZE = 500;

    const total = detallesComplete.length;
    let processed = 0;

    for (let i = 0; i < detallesComplete.length; i += BATCH_SIZE) {
      const detalles = detallesComplete.slice(i, i + BATCH_SIZE);

      // Procesar contactos ciudadanos
      const citizenContactList = detalles.flatMap(
        (det) => det.citizenContacts ?? [],
      );

      // Eliminar duplicados
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

      // Buscar contactos existentes
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

      // Crear los que no existen
      const existingSet = new Set(
        existingContacts.map(
          (c) => `${c.tipDoc}-${c.docIde}-${c.contactType}-${c.value}`,
        ),
      );

      const contactsToCreate = uniqueContacts.filter(
        (c) =>
          !existingSet.has(
            `${c.tipDoc}-${c.docIde}-${c.contactType}-${c.value}`,
          ),
      );

      if (contactsToCreate.length > 0) {
        await this.citizenContactRepository.bulkCreate(contactsToCreate);
      }

      //Crear ciudadanos (evitar duplicados)
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

      //Guardar los detalles de cartera
      for (const det of detalles) {
        det.portfolioId = portfolioId;
      }

      // Insertar o actualizar detalles
      await this.repositoryDetail.bulkCreate(detalles, {
        updateOnDuplicate: ['debt', 'currentDebt'],
      });

      processed += detalles.length;

      this.gateway.sendProgress(portfolioId, processed, total);
    }

    this.gateway.sendComplete(portfolioId);
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

      // // --- Lógica de citizenContacts ---
      // if (dto.detalles && Array.isArray(dto.detalles)) {
      //   // 1. Extraemos todos los contactos
      //   const citizenContactList = dto.detalles.flatMap(
      //     (det) => det.citizenContacts ?? [],
      //   );

      //   // 2. Quitamos duplicados en memoria
      //   const uniqueContacts = citizenContactList.filter(
      //     (contact, index, self) =>
      //       index ===
      //       self.findIndex(
      //         (c) =>
      //           c.tipDoc === contact.tipDoc &&
      //           c.docIde === contact.docIde &&
      //           c.contactType === contact.contactType &&
      //           c.value === contact.value,
      //       ),
      //   );

      //   // 3. Revisamos cuáles ya existen en BD
      //   const existingContacts = await this.citizenContactRepository.findAll({
      //     where: {
      //       [Op.or]: uniqueContacts.map((c) => ({
      //         tipDoc: c.tipDoc,
      //         docIde: c.docIde,
      //         contactType: c.contactType,
      //         value: c.value,
      //       })),
      //     },
      //   });

      //   // 4. Armamos set para lookup rápido
      //   const existingSet = new Set(
      //     existingContacts.map(
      //       (c) => `${c.tipDoc}-${c.docIde}-${c.contactType}-${c.value}`,
      //     ),
      //   );

      //   // 5. Filtramos solo los que faltan
      //   const contactsToCreate = uniqueContacts.filter(
      //     (c) =>
      //       !existingSet.has(
      //         `${c.tipDoc}-${c.docIde}-${c.contactType}-${c.value}`,
      //       ),
      //   );

      //   // 6. Insertamos en bloque
      //   if (contactsToCreate.length > 0) {
      //     await this.citizenContactRepository.bulkCreate(contactsToCreate);
      //   }

      //   // --- Lógica de detalles ---
      //   for (const d of dto.detalles) {
      //     if (d.statusCase === 'new') {
      //       await PortfolioDetail.create({
      //         idPortfolio: id,
      //         ...d,
      //         currentDebt: d.debt,
      //       });
      //     }
      //     // Aquí puedes manejar casos update/delete si aplica
      //   }

      //   // Eliminamos los ciudadanos duplicados dentro del propio array (opcional pero recomendado)
      //   const uniqueCitizen = dto.detalles.filter(
      //     (contact, index, self) =>
      //       index ===
      //       self.findIndex(
      //         (c) =>
      //           c.tipDoc === contact.tipDoc &&
      //           c.docIde === contact.docIde &&
      //           c.taxpayerName === contact.taxpayerName,
      //       ),
      //   );

      //   if (uniqueCitizen.length !== 0) {
      //     await this.cityzenRepository.bulkCreate(
      //       uniqueCitizen.map((cit) => ({
      //         tipDoc: cit.tipDoc,
      //         docIde: cit.docIde,
      //         name: cit.taxpayerName,
      //       })),
      //       {
      //         updateOnDuplicate: ['name'],
      //       },
      //     );
      //   }
      // }

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
