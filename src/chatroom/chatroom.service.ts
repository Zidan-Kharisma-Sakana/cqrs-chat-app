/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";

import { Room } from "./entities/room.entity";
import { Message } from "./entities/message.entity";
import { CreateRoomDto } from "./dto/create-room.dto";
import { AddMessageDto } from "src/gateway/dto/add-message.dto";
import { QueryBus } from "@nestjs/cqrs";
import { GetUserQuery } from "src/user/query/impl/get-user";

@Injectable()
export class ChatroomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly queryBus: QueryBus,
  ) {}

  async findAll() {
    const rooms = await this.roomRepository.find();
    return rooms;
  }

  async findOne(room_code: string) {
    const room = await this.roomRepository.findOne({
      where: { room_code },
      relations: ["messages", "users"],
    });
    if (!room) {
      throw new NotFoundException(`There is no room under code ${room_code}`);
    }

    return room;
  }

  async create(createRoomDto: CreateRoomDto) {
    const room = await this.roomRepository.create({
      ...createRoomDto,
    });

    return this.roomRepository.save(room);
  }

  async addUserToRoom(id: string, room_code: string) {
    const room = await this.findOne(room_code);
    if (room.users.find((u) => u.id == id)) {
      return;
    }
    const user = await this.queryBus.execute(new GetUserQuery({ id }, []));
    const joinedusers = [...(room.users ?? []), user];
    const updatedRoom = await this.roomRepository.preload({
      room_code: room_code,
      users: joinedusers,
    });
    return this.roomRepository.save(updatedRoom);
  }

  async addMessage(addMessageDto: AddMessageDto) {
    const { room_code, userId: id, text } = addMessageDto;

    const room = await this.findOne(room_code);
    const user = await this.queryBus.execute(new GetUserQuery({ id }, []));

    const message = await this.messageRepository.create({
      text,
      room,
      user,
    });

    return this.messageRepository.save(message);
  }
}
