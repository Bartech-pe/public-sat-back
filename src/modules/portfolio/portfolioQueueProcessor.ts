import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PortfolioService } from './portfolio.service';

@Processor('portfolio-detail-queue')
export class PortfolioQueueProcessor extends WorkerHost {
  constructor(private readonly portfolioService: PortfolioService) {
    super();
  }

  async process(job: Job<any>) {

    const { portfolioId, detalles } = job.data;

    try {
     
      await this.portfolioService.savePortfolioDetails(portfolioId, detalles);
      console.log(`✅ Detalles registrados para cartera ID ${portfolioId}`);
    
    } catch (error) {
      console.error(`❌ Error procesando cartera ${portfolioId}:`, error);
    }
  }


}
