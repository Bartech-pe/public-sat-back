import { forwardRef, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CitizenRepository } from "../repositories/citizen.repository";
import { UpdateCitizenBasicInformationDto } from "../dto/channel-room/update-citizen-basic-info.dto";
import { ChannelRoomRepository } from "../repositories/channel-room.repository";
import { Citizen, CitizenAttributes } from "../entities/citizen.entity";
import { CitizenDocType } from "@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto";
import { User } from "@modules/user/entities/user.entity";
import { MultiChannelChatGateway } from "../multi-channel-chat.gateway";
import { CreateCitizenDto } from "../dto/create-citizen.dto";
import { Inbox } from "@modules/inbox/entities/inbox.entity";
import { Channel } from "@modules/channel/entities/channel.entity";
import { IncomingMessage } from "@common/interfaces/channel-connector/incoming/incoming.interface";
import { Op } from "sequelize";
import { ChannelStatus, ChannelType } from "@common/interfaces/channel-connector/messaging.interface";
import { AssistanceRepository } from "../repositories/assistance.repository";
import { ChannelRoom } from "../entities/channel-room.entity";
import { Assistance, AssistanceStatus } from "../entities/assistance.entity";
import { ChatStatus } from "@common/interfaces/multi-channel-chat/channel-message/channel-chat-message.dto";
@Injectable()
export class CitizenService 
{

	private readonly logger = new Logger(CitizenService.name);
	
	constructor(
		private citizenRepository: CitizenRepository,
		private assistanceRepository: AssistanceRepository,
		private channelRoomRepository: ChannelRoomRepository,
		@Inject(forwardRef(() => MultiChannelChatGateway))
		private multiChannelChatGateway: MultiChannelChatGateway
	){}

	async updateBasicInfoFromCitizen(payload: UpdateCitizenBasicInformationDto): Promise<UpdateCitizenBasicInformationDto>
	{
		try {
			const room = await this.channelRoomRepository.findOne({
				include: [
					{
						model: Citizen,
						required: true,
						where: {phoneNumber: payload.phoneNumber},
					},
				],
				throwIfNotFound: false
			});
			if(!room) throw new NotFoundException("No se encontró al ciudadano.");
			const citizen = await this.citizenRepository.update(room.dataValues.citizenId!,{
				fullName: payload.fullName,
				documentType: payload.documentType as CitizenDocType,
				documentNumber: payload.documentNumber
			});
			return {
				phoneNumber: payload.phoneNumber,
				fullName: citizen[1][0].dataValues.fullName as string, 
				documentType: citizen[1][0].dataValues.documentType as string,
				documentNumber: citizen[1][0].dataValues.documentNumber as string
			};
		} catch (error) {
			throw error;
		}
	}

	async getBasicInfoFromCitizen(phoneNumber: string, )
	{
		try {
			const room = await this.channelRoomRepository.findOne({
				include: [
					{
						model: Citizen,
						required: true,
						where: { phoneNumber },
					},
				],
			})
			const citizen = room?.get('citizen').toJSON() as Citizen
			if (!citizen) throw new NotFoundException("El ciudadano no esta asociado a ningun chat.");
	
			let model : UpdateCitizenBasicInformationDto = {
				phoneNumber: citizen.phoneNumber?? '',
				fullName: citizen.fullName?? '',
				documentType: citizen.documentType?? '',
				documentNumber: citizen.documentNumber?? ''
			}
			return model
			
		} catch (error) {
			throw error
		}
	}

	async requestAdvisor(phoneNumber: string)
	{
		
		try {
			const assistanceResult = await this.assistanceRepository.findOne({
				where: { status: AssistanceStatus.IN_PROGRESS},
				include: [
					{
						model: ChannelRoom,
						required: true,
						where: {status: 'pendiente', botReplies: true},
						include: [
							{
								model: Citizen,
								required: true,
								where: {phoneNumber: phoneNumber},
							},
						]
					}
				],
			});
			if(!assistanceResult) throw new NotFoundException("No se encontró un chat con este número.")

			const assistance = assistanceResult.toJSON() as Assistance;
			const channelRoom = assistanceResult.get('channelRoom').toJSON() as ChannelRoom;
			this.logger.debug(assistanceResult)
			this.logger.debug(channelRoom)
			await this.channelRoomRepository.update(channelRoom.id,{botReplies: false, status: 'prioridad'})

			this.multiChannelChatGateway.notifyAdvisorRequest(channelRoom?.id, assistance?.id, channelRoom?.userId)
		} catch (error) {
			throw error			
		}
	}

	async createCitizen(payload: CreateCitizenDto)
	{
		const citizen = await this.citizenRepository.findOne({where: {phoneNumber: payload.phoneNumber, email: payload.email, name: payload.name}});
		if(citizen)
		{
			return citizen.toJSON();
		}
		if(!payload?.avatarUrl)
		{
			payload.avatarUrl = "https://cdn-icons-png.flaticon.com/512/149/149071.png"
		}
		
		return (await this.citizenRepository.create({...payload, fullName: payload.name})).toJSON()
	}

	public async createCitizenFromMessage(newMessage: IncomingMessage): Promise<CitizenAttributes> 
	{
		const message = newMessage.payload;
		
		const possibleNamesDuplicated = [
			message?.sender?.full_name,
			message?.sender?.alias,
			message?.sender?.phone_number,
			'Unknown'
		].filter((n): n is string => typeof n === "string");

		const citizenExists = await this.citizenRepository.findOne({
			...(newMessage.payload.channel === ChannelType.CHATSAT  ? { 
				where: {
					id: message?.sender.id,
				}
			} : {
				 where: {
					 phoneNumber: message?.sender?.phone_number,
					 name: {
						 [Op.in]: possibleNamesDuplicated
					 }
				 }
			 }),
		});

		if (citizenExists) 
		{
			return citizenExists.toJSON();
		}
		
		const temporalDto: CreateCitizenDto = {
			name: message?.sender?.full_name || message?.sender?.alias || message?.sender?.phone_number || 'Unknown',
			phoneNumber: message?.sender?.phone_number,
			externalUserId: message?.sender?.id?.toString(),
			isExternal: newMessage.payload.channel === ChannelType.CHATSAT,
			email: message?.sender?.email?.toString(),
			avatarUrl: message?.sender?.avatar?? "https://cdn-icons-png.flaticon.com/512/149/149071.png",
		};

		return (await this.citizenRepository.create(temporalDto)).toJSON();
	}
	

}