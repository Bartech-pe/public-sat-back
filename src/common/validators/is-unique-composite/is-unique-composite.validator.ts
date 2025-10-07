import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

interface ConstraintArgs {
  model: any;
  fields: string[];
  excludeIdField?: string;
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueCompositeConstraint
  implements ValidatorConstraintInterface
{
  async validate(_: any, args: ValidationArguments): Promise<boolean> {
    const { model, fields, excludeIdField }: ConstraintArgs =
      args.constraints[0];
    const data = args.object as any;

    const id = (args.object as any).id;

    // Construir cláusula WHERE
    const where: Record<string, any> = {};
    for (const field of fields) {
      const value = data[field];
      if (typeof value === 'undefined') return false;
      where[field] = value;
    }

    // Excluir el ID si se está actualizando
    if (excludeIdField && data[excludeIdField]) {
      where['id'] = { $ne: data[excludeIdField] }; // o Sequelize.Op.ne si estás importando Sequelize
    }

    const existing = await model.findOne({ where });

    if (!existing) return true;
    return existing.id === id;
  }

  defaultMessage(args: ValidationArguments): string {
    const { fields } = args.constraints[0];
    return `La combinación de ${fields.join(' + ')} ya existe`;
  }
}
