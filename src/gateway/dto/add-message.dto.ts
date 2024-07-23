import { IsOptional, IsString, IsUUID } from 'class-validator';

export class AddMessageDto {
  @IsString()
  text: string;

  @IsString()
  room_code: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
