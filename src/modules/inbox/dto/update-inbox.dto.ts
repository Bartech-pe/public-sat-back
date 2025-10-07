import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateInboxDto } from './create-inbox.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { ValidationMessages as v } from '@common/messages/validation-messages';

export class UpdateInboxDto extends PartialType(CreateInboxDto) {
	@ApiProperty({ description: 'Nombre la bandeja de entrada' })
	@IsNotEmpty({ message: v.isNotEmpty('name') })
	@IsString({ message: v.isString('name') })
	name: string;
}

