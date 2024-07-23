import { Entity, OneToMany, ManyToMany, PrimaryColumn } from 'typeorm';

import { User } from 'src/user/entities/user.entity';
import { Message } from './message.entity';

@Entity()
export class Room {
  @PrimaryColumn()
  room_code: string;

  @ManyToMany(() => User, (user: User) => user.rooms)
  users: Array<User>;

  @OneToMany(() => Message, (message: Message) => message.room)
  messages: Array<Message>;
}
