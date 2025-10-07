import { Sequelize } from 'sequelize-typescript';
import { contextNamespace } from '../context/request-context.service';

function getUserFromContext() {
  return contextNamespace?.active ? contextNamespace.get('user') : null;
}

export function addAuditHooks(sequelize: Sequelize) {
  sequelize.addHook('beforeCreate', (instance: any) => {
    const user = getUserFromContext();
    if (user) {
      if ('createdBy' in instance) instance.createdBy = user.id;
      if ('updatedBy' in instance) instance.updatedBy = user.id;
    }
  });

  sequelize.addHook('beforeUpdate', (instance: any) => {
    const user = getUserFromContext();
    if (user && 'updatedBy' in instance) {
      instance.updatedBy = user.id;
    }
  });

  sequelize.addHook('beforeDestroy', (instance: any) => {
    const user = getUserFromContext();
    if (user && 'deletedBy' in instance) {
      instance.deletedBy = user.id;
    }
  });
}
