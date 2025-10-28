import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
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
import { Op } from 'sequelize';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class CitizenAssistanceService {
  constructor(
    private readonly repository: CitizenAssistanceRepository,
    private readonly portfolioDetailRepository: PortfolioDetailRepository,
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
              where: {},
            }
          : {
              where: {},
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
        const portfolioDetail = await this.portfolioDetailRepository.findOne({
          where: { id: dto.portfolioDetailId },
        });
        if (portfolioDetail && !portfolioDetail.toJSON().status) {
          await portfolioDetail.update({
            status: true,
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

  async managedDownload(
    portfolioId: number,
    dateSelected: Date,
    res: Response,
  ): Promise<void> {
    const startDay = new Date(dateSelected);
    startDay.setHours(0, 0, 0);
    const endDay = new Date();
    endDay.setHours(23, 59, 59);
    const result = await this.repository.findAll({
      where: {
        createdAt: {
          [Op.between]: [startDay, endDay],
        },
      },
      include: [
        {
          model: PortfolioDetail,
          where: { portfolioId },
          include: [Portfolio],
          required: true,
        },
        { model: User, as: 'createdByUser' },
      ],
    });

    if (result.length == 0) {
      throw new NotFoundException(
        'No se encontró información para el día y cartera seleccionados',
      );
    }

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Atenciones');

    // Encabezados de columnas
    worksheet.columns = [
      { header: 'FECHA', key: 'createdAt', width: 20 },
      { header: 'CARTERA', key: 'portfolio', width: 25 },
      { header: 'SECTORISTA', key: 'user', width: 25 },
      { header: 'TIPO DE CONTRIBUYENTE', key: 'taxpayerType', width: 25 },
      { header: 'CONTRIBUYENTE', key: 'taxpayerName', width: 45 },
      { header: 'TIPO DOC. IDE.', key: 'docType', width: 25 },
      { header: 'N° DOC. IDE.', key: 'docIde', width: 25 },
      { header: 'CODIGO DE CONTRIBUYENTE', key: 'code', width: 25 },
      { header: 'DEUDA INICIAL', key: 'debt', width: 25 },
      { header: 'TIPO DE ATENCIÓN', key: 'assistanceType', width: 25 },
      { header: 'MÉTODO DE CONTACTO', key: 'method', width: 25 },
      { header: 'RESULTADO DE CONTACTO', key: 'result', width: 25 },
      { header: 'OBSERVACIÓN', key: 'observation', width: 25 },
    ];

    const worksheetVerify = workbook.addWorksheet('Verificaciones de pago');

    // Encabezados de columnas
    worksheetVerify.columns = [
      { header: 'FECHA', key: 'createdAt', width: 20 },
      { header: 'CARTERA', key: 'portfolio', width: 25 },
      { header: 'SECTORISTA', key: 'user', width: 25 },
      { header: 'TIPO DE CONTRIBUYENTE', key: 'taxpayerType', width: 25 },
      { header: 'CONTRIBUYENTE', key: 'taxpayerName', width: 45 },
      { header: 'TIPO DOC. IDE.', key: 'docType', width: 25 },
      { header: 'N° DOC. IDE.', key: 'docIde', width: 25 },
      { header: 'CODIGO DE CONTRIBUYENTE', key: 'code', width: 25 },
      { header: 'DEUDA INICIAL', key: 'debt', width: 25 },
      { header: 'DETALLE', key: 'detail', width: 25 },
    ];

    // Agregar filas
    result
      .map((item) => item.toJSON())
      .forEach((item: CitizenAssistance) => {
        if (!item.verifyPayment) {
          worksheet.addRow({
            createdAt: item.createdAt,
            portfolio: item.portfolioDetail.portfolio.name,
            user: item.createdByUser?.name,
            taxpayerType: item.portfolioDetail.taxpayerType,
            taxpayerName: item.portfolioDetail.taxpayerName,
            docType: item.tipDoc,
            docIde: item.docIde,
            code: item.portfolioDetail.code,
            debt: item.portfolioDetail.debt,
            assistanceType: item.type,
            method: `${item.method}: ${item.contact}`,
            result: item.result,
            observation: item.observation,
          });
        } else {
          worksheetVerify.addRow({
            createdAt: item.createdAt,
            portfolio: item.portfolioDetail.portfolio.name,
            user: item.createdByUser?.name,
            taxpayerType: item.portfolioDetail.taxpayerType,
            taxpayerName: item.portfolioDetail.taxpayerName,
            docType: item.tipDoc,
            docIde: item.docIde,
            code: item.portfolioDetail.code,
            debt: item.portfolioDetail.debt,
            detail: item.result,
          });
        }
      });

    // 5️⃣ Configurar headers de descarga
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="atenciones_${startDay.toISOString().split('T')[0]}.xlsx"`,
    );

    // 6️⃣ Escribir el archivo en el response
    await workbook.xlsx.write(res);
    res.end();
  }
}
