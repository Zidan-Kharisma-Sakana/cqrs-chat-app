import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Message } from 'src/chatroom/entities/message.entity';
import { Room } from 'src/chatroom/entities/room.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 20, unique: true })
  username: string;

  @Column({ length: 60 })
  password: string;

  @OneToMany(() => Message, (message: Message) => message.user)
  messages: Array<Message>;

  @JoinTable({ name: 'user_to_room' })
  @ManyToMany(() => Room, (room: Room) => room.users, { eager: true })
  rooms: Array<Room>;
}
