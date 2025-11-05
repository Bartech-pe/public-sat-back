import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Put } from "@nestjs/common";
import { CitizenService } from "../services/citizen.service";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { User } from "@modules/user/entities/user.entity";
import { UpdateCitizenBasicInformationDto } from "../dto/channel-room/update-citizen-basic-info.dto";
import { CreateCitizenDto } from "../dto/create-citizen.dto";
import { Citizen, CitizenAttributes } from "../entities/citizen.entity";

@Controller('citizen')
export class CitizenController {

	constructor(
		private citizenService: CitizenService,
	) {}


	@Post(':phoneNumber/request-advisor')
	async requestAdvisor( @Param('phoneNumber') phoneNumber: string) {
		try {
			await this.citizenService.requestAdvisor(phoneNumber);
			return {
				message: "Se ha solicitado un asesor.",
				status: 200
			}
		} catch (error) {
			throw new HttpException
			(
				{
					message: error.message || 'Error al obtener la informacion básica del ciudadano.',
				},
				error.status || HttpStatus.BAD_REQUEST,
			);
		}
	}

	@Get(':phoneNumber/basic-information')
	async getCitizenBasicInformation(
		@Param('phoneNumber') phoneNumber: string
	): Promise<UpdateCitizenBasicInformationDto> {
		try {
			return await this.citizenService.getBasicInfoFromCitizen(phoneNumber);
		} catch (error) {
			throw new HttpException(
			{
				message: error.message || 'Error al obtener la informacion básica del ciudadano.',
			},
			error.status || HttpStatus.BAD_REQUEST,
			);
		}
	}

	@Post('')
	async createCitizen(
		@Body() payload: CreateCitizenDto
	): Promise<CitizenAttributes> {
		try {
			return await this.citizenService.createCitizen(payload);
		} catch (error) {
			throw new HttpException(
			{
				message: error.message || 'Error en la creación del ciudadano.',
			},
			error.status || HttpStatus.BAD_REQUEST,
			);
		}
	}
	
	@Put('basic-information/update')
	async updateCitizenBasicInformation(@Body() payload: UpdateCitizenBasicInformationDto): Promise<UpdateCitizenBasicInformationDto> {
		try {
			return await this.citizenService.updateBasicInfoFromCitizen(payload);
		} catch (error) {
			throw new HttpException
			(
				{
					message: error.message || 'Error al obtener la informacion básica del ciudadano.',
				},
				error.status || HttpStatus.BAD_REQUEST,
			);
		}
	}
}
