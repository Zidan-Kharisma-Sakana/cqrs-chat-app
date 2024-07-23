import { Module } from '@nestjs/common';

import { ChatGateway } from './gateway';

import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChatroomModule } from 'src/chatroom/chatroom.module';
import { CreateUserHandler } from 'src/user/commands/handlers/create-user.handler';
import { UserCreatedEvent } from 'src/user/events/impl/user-created.event';
import { GetUserQuery } from 'src/user/query/impl/get-user';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

const CommandHandlers = [CreateUserHandler];
const EventHandlers = [UserCreatedEvent];
const QueryHandlers = [GetUserQuery];

@Module({
  imports: [
    UserModule,
    AuthModule,
    ChatroomModule,
    CqrsModule,
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    ChatGateway,
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
  ],
})
export class GatewayModule {}
