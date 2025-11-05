import { IsString } from 'class-validator';

export class CreateMailCredential {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  clientId: string;

  @IsString()
  topicName: string;

  @IsString()
  clientSecret: string;

  @IsString()
  projectId: string;
}
