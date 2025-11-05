import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAsignarCarteraDto } from './dto/create-asignar-cartera.dto';
import { UpdateAsignarCarteraDto } from './dto/update-asignar-cartera.dto';
import { InjectModel } from '@nestjs/sequelize';
import { AsignarCartera } from './entities/asignar-cartera.entity';
import { Cartera } from '@modules/carteras/entities/cartera.entity';
import { User } from '@modules/user/entities/user.entity';
import { Op } from 'sequelize';
import { AsignarCarteraDto } from './dto/create-cartera-dto';
import { CarteraDetalle } from '@modules/cartera-detalle/entities/cartera-detalle.entity';

@Injectable()
export class AsignarCarteraService {
  constructor(
    @InjectModel(AsignarCartera)
    private readonly asignarCarteraModel: typeof AsignarCartera,

    @InjectModel(CarteraDetalle)
    private readonly carteraDetalleModel: typeof CarteraDetalle,
  ) {}

  create(createAsignarCarteraDto: CreateAsignarCarteraDto) {
    return 'This action adds a new asignarCartera';
  }

  async createMultiple(detalles: Partial<AsignarCarteraDto>[]) {
    try {
      // Extraemos todas las combinaciones de id_cartera_detalle e id_user del array recibido
      const condiciones = detalles.map((d) => ({
        idCarteraDetalle: d.idCarteraDetalle,
        idUser: d.idUser,
      }));

      // Buscamos los que ya existen
      const existentes = await this.asignarCarteraModel.findAll({
        where: {
          [Op.or]: condiciones,
        },
        attributes: ['idCarteraDetalle', 'idUser'],
        raw: true,
      });

      // Creamos un Set de las combinaciones existentes para fácil comparación
      const existentesSet = new Set(
        existentes.map((e) => `${e.idCarteraDetalle}-${e.idUser}`),
      );

      // Filtramos solo los que NO existen
      const nuevos = detalles.filter(
        (d) => !existentesSet.has(`${d.idCarteraDetalle}-${d.idUser}`),
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
      const result = await this.asignarCarteraModel.bulkCreate(nuevos, {
        validate: true,
        returning: true,
      });

      //actualizar en el carteraDetalleModel

      await Promise.all(
          nuevos.map(async (element) => {
            const actualizar = await this.carteraDetalleModel.findOne({
              where: { id: element.idCarteraDetalle }
            });

            if (actualizar) {
              await actualizar.update({
                idUser: element.idUser
              });
            }
          })
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

  findAll() {
    return `This action returns all asignarCartera`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asignarCartera`;
  }

  async findByCarteraId(id_user: number): Promise<AsignarCartera[]> {
    const detalles = await this.asignarCarteraModel.findAll({
      where: { idUser: id_user },
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

  update(id: number, updateAsignarCarteraDto: UpdateAsignarCarteraDto) {
    return `This action updates a #${id} asignarCartera`;
  }

  remove(id: number) {
    return `This action removes a #${id} asignarCartera`;
  }
}
