import { IsInt, IsString, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidationMessages as v } from '@common/messages/validation-messages'; // Adjust path
export class CreateSurveyDto {
  @ApiProperty({ description: 'ID of the associated assistance' })
  @IsInt({ message: v.isInt('assistanceId') })
  @IsNotEmpty({ message: v.isNotEmpty('assistanceId') })
  assistanceId: number;

  @ApiProperty({ description: 'ID of the channel room' })
  @IsInt({ message: v.isInt('channelRoomId') })
  @IsNotEmpty({ message: v.isNotEmpty('channelRoomId') })
  channelRoomId: number;

  @ApiProperty({ description: 'ID of the citizen' })
  @IsInt({ message: v.isInt('citizenId') })
  @IsNotEmpty({ message: v.isNotEmpty('citizenId') })
  citizenId: number;

  @ApiPropertyOptional({ description: 'Comment provided in the survey' })
  @IsOptional()
  @IsString({ message: v.isString('comment') })
  comment?: string;

  @ApiProperty({ description: 'Rating given in the survey (1-5)' })
  @IsInt({ message: v.isInt('rating') })
  @IsNotEmpty({ message: v.isNotEmpty('rating') })
  rating: number;

  @ApiProperty({ description: 'ID of the user who submitted the survey' })
  @IsInt({ message: v.isInt('userId') })
  @IsNotEmpty({ message: v.isNotEmpty('userId') })
  userId: number;


}