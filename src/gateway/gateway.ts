/* eslint-disable @typescript-eslint/no-unused-vars */
import { ForbiddenException, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';

import { AddMessageDto } from './dto/add-message.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { ChatroomService } from 'src/chatroom/chatroom.service';
import { LeaveRoomDto } from './dto/leave-room.dto';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserQuery } from 'src/user/query/impl/get-user';

@UsePipes(new ValidationPipe())
@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server;

  connectedUsers: Map<string, string> = new Map();

  constructor(
    private readonly authService: AuthService,
    private readonly roomService: ChatroomService,
    private readonly queryBus: QueryBus,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    console.log('handleConnection');
    const token = client.handshake.query.token.toString();
    const payload = await this.authService.verifyAccessToken(token);

    const user =
      payload &&
      (await this.queryBus.execute(
        new GetUserQuery(
          {
            id: payload.id,
          },
          [],
        ),
      ));

    if (!user) {
      client.disconnect(true);

      return;
    }

    this.connectedUsers.set(client.id, user.id);
    console.log(this.connectedUsers);
    // if (room) {
    //   return this.onRoomJoin(client, { roomId: room.id });
    // }
  }

  async handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
  }

  @SubscribeMessage('message')
  async onMessage(client: Socket, addMessageDto: AddMessageDto) {
    console.log('onMessage', addMessageDto);
    const userId = this.connectedUsers.get(client.id);
    addMessageDto.userId = userId;
    await this.roomService.addMessage(addMessageDto);
    client.to(addMessageDto.room_code).emit('message', addMessageDto.text);
  }

  @SubscribeMessage('join')
  async onRoomJoin(client: Socket, joinRoomDto: JoinRoomDto) {
    console.log('Join', joinRoomDto);
    const { room_code } = joinRoomDto;
    const limit = 10;

    const room = await this.roomService.findOne(room_code);

    if (!room) return;

    const userId = this.connectedUsers.get(client.id);
    await this.roomService.addUserToRoom(userId, room_code);

    const messages = room.messages.slice(limit * -1);
    client.join(room_code);
    client.emit('message', messages);
  }

  @SubscribeMessage('leave')
  async onRoomLeave(client: Socket, leaveRoomDto: LeaveRoomDto) {
    const { room_code } = leaveRoomDto;
    const userId = this.connectedUsers.get(client.id);

    client.leave(room_code);
  }
}
