import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InboxRepository } from '@modules/inbox/repositories/inbox.repository';
import { Inbox } from '@modules/inbox/entities/inbox.entity';
import { Channel } from '@modules/channel/entities/channel.entity';
import { CategoryChannelEnum } from '@common/enums/category-channel.enum';
import { ChannelEnum } from '@common/enums/channel.enum';
import { VicidialCredentialRepository } from '../repositories/vicidial-credential.repository';
import { CreateVicidialCredentialDto } from '../dto/create-vicidial-inbox.dto';
import { BaseResponseDto } from '@common/dto/base-response.dto';

@Injectable()
export class VicidialCredentialService {
	private readonly logger = new Logger(VicidialCredentialService.name);
	

  constructor(
	private readonly vicidialCredentialRepository: VicidialCredentialRepository,
	private readonly inboxRepository: InboxRepository,
  ) {}

  async createOrUpdateCredential(body: CreateVicidialCredentialDto): Promise<BaseResponseDto> {
	const response: BaseResponseDto = { success: false, message: '' };

	try {
		// 👉 Si envía inboxId, actualiza
		if (body.inboxId) {
		const inbox = await this.inboxRepository.findById(body.inboxId);
		if (!inbox) throw new Error('Inbox no encontrado');

		await inbox.update({ name: body.name });

		const credential = await this.vicidialCredentialRepository.findOne({
			where: { inboxId: body.inboxId },
		});

		if (credential) {
			await credential.update({
			vicidialHost: body.vicidialHost,
			publicIp: body.publicIp,
			privateIp: body.privateIp,
			user: body.user,
			password: body.password,
			});
			response.message = 'Credencial Vicidial actualizada correctamente.';
		} else {
			await this.vicidialCredentialRepository.create({
			inboxId: body.inboxId,
			vicidialHost: body.vicidialHost,
			publicIp: body.publicIp,
			privateIp: body.privateIp,
			user: body.user,
			password: body.password,
			});
			response.message = 'Credencial Vicidial creada para el inbox existente.';
		}

		response.success = true;
		return response;
		}

		// 👉 Si NO envía inboxId, crea un nuevo inbox y credencial
		const existingInbox = await this.inboxRepository.findOne({
		where: { channelId: ChannelEnum.VICIDIAL },
		});

		if (existingInbox) throw new Error('Ya existe una credencial Vicidial.');

		const newInbox = await this.inboxRepository.create({
		name: body.name,
		channelId: ChannelEnum.VICIDIAL,
		});

		await this.vicidialCredentialRepository.create({
		inboxId: newInbox.id,
		vicidialHost: body.vicidialHost,
		publicIp: body.publicIp,
		privateIp: body.privateIp,
		user: body.user,
		password: body.password,
		});

		response.success = true;
		response.message = 'Credencial Vicidial creada con éxito.';
		return response;

	} catch (error) {
		this.logger.error(error.toString());
		response.error = error.toString();
		response.message = 'Error al procesar la credencial.';
		return response;
	}
	}


  async deleteEmailInbox() {
	const inbox = await this.inboxRepository.findOne({
	  where: { channelId: ChannelEnum.EMAIL },
	});

	if (inbox?.toJSON()?.id) {
	  this.inboxRepository.delete(inbox?.toJSON()?.id);
	}
  }
}
