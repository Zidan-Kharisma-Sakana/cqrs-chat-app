import { Module } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Message } from './entities/message.entity';
import { UserModule } from 'src/user/user.module';
import { ChatroomController } from './chatroom.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Room, Message]), UserModule],
  controllers: [ChatroomController],
  providers: [ChatroomService],
  exports: [ChatroomService],
})
export class ChatroomModule {}
