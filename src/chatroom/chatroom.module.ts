import { Module } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Message } from './entities/message.entity';
import { UserModule } from 'src/user/user.module';
import { ChatroomController } from './chatroom.controller';
import { User } from 'src/user/entities/user.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { GetUserQueryHandler } from 'src/user/query/handlers/get-user.handler';

const CommandHandlers = [];
const EventHandlers = [];
const QueryHandlers = [GetUserQueryHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, Message, User]),
    UserModule,
    CqrsModule,
  ],
  controllers: [ChatroomController],
  providers: [
    ChatroomService,
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
  exports: [ChatroomService],
})
export class ChatroomModule {}
