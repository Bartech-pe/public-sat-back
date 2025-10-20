import { forwardRef, Inject } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Op } from 'sequelize';
import { PortfolioDetailRepository } from '@modules/portfolio-detail/repositories/portfolio-detail.repository';
import { PortfolioGateway } from './portfolio.gateway';
import { PortfolioDetail } from '@modules/portfolio-detail/entities/portfolio-detail.entity';
import { CitizenContactRepository } from '@modules/citizen/repositories/citizen-contact.repository';
import { CitizenRepository } from '@modules/citizen/repositories/citizen.repository';
import { PortfolioRepository } from './repositories/portfolio.repository';
import { CitizenContact } from '@modules/citizen/entities/citizen-contact.entity';

@Processor('portfolio-detail-queue')
export class PortfolioQueueProcessor extends WorkerHost {
  private readonly BATCH_SIZE = 100;
  private isCancelled = new Map<number, boolean>(); // <--- Control de cancelación por portfolioId

  constructor(
    private readonly portfolioRepository: PortfolioRepository,
    private readonly portfolioDetailRepository: PortfolioDetailRepository,
    private readonly citizenRepository: CitizenRepository,
    private readonly citizenContactRepository: CitizenContactRepository,
    @Inject(forwardRef(() => PortfolioGateway))
    private readonly gateway: PortfolioGateway,
  ) {
    super();
  }

  /**
   * Permite marcar un proceso como cancelado externamente
   */
  cancelProcess(portfolioId: number) {
    this.isCancelled.set(portfolioId, true);
  }

  /**
   * Método principal de procesamiento de la cola
   */
  async process(
    job: Job<{
      updated: boolean;
      portfolioId: number;
      name: string;
      details: PortfolioDetail[];
    }>,
  ) {
    const { portfolioId, name, details, updated } = job.data;
    const total = details.length;

    const startTime = Date.now();
    try {
      let processed = 0;

      this.gateway.sendProgress(
        updated,
        portfolioId,
        name,
        processed,
        total,
        undefined,
      );

      for (let i = 0; i < total; i += this.BATCH_SIZE) {
        // Si el proceso fue cancelado externamente, se detiene
        if (this.isCancelled.get(portfolioId)) {
          console.warn(`Carga cancelada para cartera ${name}`);
          this.gateway.sendCancelled(portfolioId, name, updated);
          return;
        }

        const batch = details.slice(i, i + this.BATCH_SIZE);

        // ---- Procesamiento optimizado ----
        await this.processBatch(portfolioId, batch);

        processed += batch.length;
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = processed / total;
        const estimatedTotalTime = elapsed / progress; // tiempo total estimado
        const remaining = estimatedTotalTime - elapsed; // segundos restantes

        console.log(
          `${name} => ${processed}/${total} (${(progress * 100).toFixed(2)}%) | ETA: ${remaining.toFixed(1)}s`,
        );

        this.gateway.sendProgress(
          updated,
          portfolioId,
          name,
          processed,
          total,
          remaining,
        );
      }

      this.gateway.sendComplete(portfolioId, name);
      console.log(`Detalles registrados para cartera ID ${portfolioId}`);
    } catch (error) {
      console.error(`Error procesando cartera ${portfolioId}:`, error);
      this.gateway.sendError(portfolioId, name, error.message);
    } finally {
      // Limpieza del estado de cancelación
      this.isCancelled.delete(portfolioId);
    }
  }

  /**
   * Procesa un lote de PortfolioDetails
   */
  private async processBatch(portfolioId: number, batch: PortfolioDetail[]) {
    // Extraer y limpiar contactos
    const contactList = batch.flatMap((d) => d.citizenContacts || []);
    const uniqueContacts = this.removeDuplicates(
      contactList,
      (c) => `${c.tipDoc}-${c.docIde}-${c.contactType}-${c.value}`,
    );

    console.log('uniqueContacts', uniqueContacts.length);

    const contactsToCreate: CitizenContact[] = [];
    for (let i = 0; i < uniqueContacts.length; i += this.BATCH_SIZE) {
      const chunk = uniqueContacts.slice(i, i + this.BATCH_SIZE);

      const existingContacts = await this.citizenContactRepository.findAll({
        where: {
          [Op.or]: chunk.map((c) => ({
            tipDoc: c.tipDoc,
            docIde: c.docIde,
            contactType: c.contactType,
            value: c.value,
          })),
        },
        attributes: ['tipDoc', 'docIde', 'contactType', 'value'],
      });

      const existingSet = new Set(
        existingContacts.map(
          (c) => `${c.tipDoc}-${c.docIde}-${c.contactType}-${c.value}`,
        ),
      );

      const newOnes = chunk.filter(
        (c) =>
          !existingSet.has(
            `${c.tipDoc}-${c.docIde}-${c.contactType}-${c.value}`,
          ),
      );

      contactsToCreate.push(...newOnes);
    }

    if (contactsToCreate.length > 0) {
      await this.citizenContactRepository.bulkCreate(contactsToCreate);
    }

    // Crear/actualizar ciudadanos
    const uniqueCitizens = this.removeDuplicates(
      batch,
      (c) => `${c.tipDoc}-${c.docIde}-${c.taxpayerName}`,
    );

    for (let i = 0; i < uniqueCitizens.length; i += this.BATCH_SIZE) {
      const chunk = uniqueCitizens.slice(i, i + this.BATCH_SIZE);
      await this.citizenRepository.bulkCreate(
        chunk.map((cit) => ({
          tipDoc: cit.tipDoc,
          docIde: cit.docIde,
          name: cit.taxpayerName,
        })),
        { updateOnDuplicate: ['name'] },
      );
    }

    // Insertar o actualizar detalles
    await this.portfolioDetailRepository.bulkCreate(
      batch.map((item) => ({ ...item, portfolioId })),
      { updateOnDuplicate: ['debt', 'currentDebt'] },
    );
  }

  /**
   * Utilidad genérica para eliminar duplicados
   */
  private removeDuplicates<T>(arr: T[], keyFn: (item: T) => string): T[] {
    const seen = new Set<string>();
    return arr.filter((item) => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async deletePortfolio(id: number) {
    await this.portfolioRepository.delete(id);
  }
}
