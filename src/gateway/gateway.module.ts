import { Module } from '@nestjs/common';

import { ChatGateway } from './gateway';

import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChatroomModule } from 'src/chatroom/chatroom.module';

@Module({
  imports: [UserModule, AuthModule, ChatroomModule],
  providers: [ChatGateway],
})
export class GatewayModule {}
