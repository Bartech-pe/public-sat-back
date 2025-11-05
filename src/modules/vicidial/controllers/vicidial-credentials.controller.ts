import { Body, Controller, Post } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { VicidialCredentialService } from "../services/vicidial-credentials.service";
import { BaseResponseDto } from "@common/dto/base-response.dto";
import { CreateVicidialCredentialDto } from "../dto/create-vicidial-inbox.dto";

@Controller('vicidial-credentials')
export class VicidialCredentialsController {
  constructor(private readonly vicidialCredentialService: VicidialCredentialService) {}
  
  @Post()
  create(@Body() dto: CreateVicidialCredentialDto): Promise<BaseResponseDto> {
	return this.vicidialCredentialService.createOrUpdateCredential(dto);
  }
}