import { OnApplicationBootstrap, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { addAuditHooks } from '../../common/hooks/audit-sequelize-hook';

@Injectable()
export class SequelizeHooksProvider implements OnApplicationBootstrap {
  constructor(private readonly sequelize: Sequelize) {}

  onApplicationBootstrap() {
    addAuditHooks(this.sequelize);
  }
}
