import { IsString } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  room_code: string;
}
