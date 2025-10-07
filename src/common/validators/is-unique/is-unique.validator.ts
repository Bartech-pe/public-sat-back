import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly sequelize: Sequelize) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [Model, property = args.property] = args.constraints;

    const id = (args.object as any).id;

    const where = { [property]: value };

    const existing = await Model.findOne({ where });

    if (!existing) return true;
    return existing.id === id;
  }

  defaultMessage(args: ValidationArguments): string {
    const property = args.property;
    return `El campo ${property} ya está en uso`;
  }
}
