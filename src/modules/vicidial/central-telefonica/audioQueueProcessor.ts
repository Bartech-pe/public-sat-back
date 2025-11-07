import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AudioStoreService } from './services/audio-store.service';

@Processor('register-details-audio')
export class AudioQueueProcessor extends WorkerHost {
  constructor(private readonly audioService: AudioStoreService) {
    super();
  }

  async process(job: Job<any>) {
    const { list_id, detalles, list, type } = job.data;

    try {
      await this.audioService.savePortfolioDetails(list_id, detalles, type);
    } catch (error) {}
  }
}
