import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RequestWithUser } from './interfaces/request-with-user.interface';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ChatroomService } from './chatroom.service';

@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly roomService: ChatroomService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':room_code')
  async findOne(@Param('room_code') room_code: string) {
    return this.roomService.findOne(room_code);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async find() {
    return this.roomService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    return this.roomService.create(createRoomDto);
  }
}
