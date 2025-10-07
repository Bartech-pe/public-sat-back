import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsUniqueCompositeConstraint } from './is-unique-composite.validator';

interface UniqueCompositeOptions {
  model: any;
  fields: string[];
  excludeIdField?: string; // útil para updates
}

export function IsUniqueComposite(
  options: UniqueCompositeOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isUniqueComposite',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [options],
      options: validationOptions,
      validator: IsUniqueCompositeConstraint,
    });
  };
}