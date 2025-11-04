import { Module } from '@nestjs/common';
import { CENTRAL_DB, DatabaseCentralService } from './database-central.service';

@Module({
  providers: [
    DatabaseCentralService,
    {
      provide: CENTRAL_DB,
      useFactory: (service: DatabaseCentralService) => service.getConnection(),
      inject: [DatabaseCentralService],
    },
  ],
  exports: [CENTRAL_DB, DatabaseCentralService],
})
export class DatabaseCentralModule {}
