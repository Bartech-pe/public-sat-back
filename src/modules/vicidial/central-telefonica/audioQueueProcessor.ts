import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AudioService } from './services/audio.service';

@Processor('register-details-audio')
export class AudioQueueProcessor extends WorkerHost {
  constructor(private readonly audioService: AudioService) {
    super();
  }

  async process(job: Job<any>) {

    const { list_id, detalles,list,type } = job.data;

    try {
      await this.audioService.savePortfolioDetails(list_id, detalles,type);
    } catch (error) {

    }
  }


}
