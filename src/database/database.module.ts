import { Module } from '@nestjs/common';
import { DatabaseCentralModule } from '@database/central/database-central.module';
import { DatabaseCrmModule } from '@database/crm/database-crm.module';

@Module({
  imports: [DatabaseCentralModule, DatabaseCrmModule],
})
export class DatabaseModule {}
