import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Call } from '../entities/call.entity';
import { PaginatedResponse } from '@common/interfaces/paginated-response.interface';
import { User } from '@modules/user/entities/user.entity';

export class CallCollection implements PaginatedResponse<CallItem> {
  total?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  page: number;
  pages: number;
  data: CallItem[];
}
export class CallCollection2 implements PaginatedResponse<Call> {
  total?: number | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  page: number;
  pages: number;
  data: Call[];
}
export class CallItem {
  callId: number;
  duration: string;
  recording?: string;
  phoneNumber: string;
  hour: string;
  state: string;
  stateIcon: string;
  advisor: string;
  stateStyle: string;
}
export class CallStateItem {
  name: string;
  icon: string;
  style: string;
  total: string;
}
export class CallItemRow {
  recording_id: number;
  full_name: string;
  user: string;
  lead_id: number;
  filename: string;
  recording_location: string;
  call_date: string; // ISO date string
  length_in_sec: number;
  phone_number: string;
  status: string;
  status_name: string;
}

export class CallItemNew {
  recordingId: number;
  user: User;
  leadId: number;
  filename: string;
  recordingLocation: string;
  callDate: Date; // ISO date string
  lengthInSec: number;
  phoneNumber: string;
  status: string;
  statusName: string;
}

export class CreateCallDto {
  @ApiProperty({
    description: 'duration',
    example: 23424,
  })
  @IsNumber()
  duration: number;
  @ApiProperty({
    description: 'recording',
    example: 'gdfdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  recording?: string;
  @ApiProperty({
    description: 'phone',
    example: '123456789',
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
  @ApiProperty({
    description: 'advisor',
    example: 1,
  })
  @IsNumber()
  advisorId: number;
  @ApiProperty({
    description: 'state',
    example: 1,
  })
  @IsNumber()
  stateId: number;
}

export class AdvisorItem {
  id: string;
  displayName: string;
}
export class AdvisorItemInfo extends AdvisorItem {
  phonelogin: string;
}
export class StateCountItem {
  name: string;
  total: number;
  icon: string;
  style: string;
}
export const StateCountItems: StateCountItem[] = [
  { name: 'Total', total: 0, icon: 'mdi:account', style: 'text-blue-500' },
  {
    name: 'Concluida',
    total: 0,
    icon: 'mdi:check-circle',
    style: 'text-green-500',
  },
  {
    name: 'Abandonado',
    total: 0,
    icon: 'mdi:close-circle',
    style: 'text-red-500',
  },
  {
    name: 'Escalado',
    total: 0,
    icon: 'mdi:arrow-up',
    style: 'text-yellow-500',
  },
];
export class StateCountQuery {
  Total: number;
  Concluida: number | null;
  Abandonado: number | null;
  Escalado: number | null;
}
