import { Model, ModelStatic } from 'sequelize-typescript';

export function getDbFields<T extends Model>(
  model: ModelStatic<T>,
  attributes: (keyof T)[],
): string[] {
  const rawAttrs = (model as any).rawAttributes; // Sequelize metadata
  return attributes.map((attr) => {
    const column = rawAttrs[attr as string];
    return column?.field || (attr as string);
  });
}
