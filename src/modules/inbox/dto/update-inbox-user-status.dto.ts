import { IsNumber } from "class-validator";

export class UpdateInboxUserStatus {
    @IsNumber()
    inboxId: number; 
     @IsNumber()
    userId: number;
}
