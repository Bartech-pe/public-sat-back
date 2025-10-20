import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AudioService } from './services/audio.service';

@Processor('register-details-audio')
export class AudioQueueProcessor extends WorkerHost {
  constructor(private readonly audioService: AudioService) {
    super();
  }

  async process(job: Job<any>) {

    const { list_id, detalles } = job.data;

     console.log(job.data);
    try {
     
      await this.audioService.savePortfolioDetails(list_id, detalles);
      console.log(`✅ Detalles registrados para cartera ID ${list_id}`);
    
    } catch (error) {
      console.error(`❌ Error procesando cartera ${list_id}:`, error);
    }
  }


}
