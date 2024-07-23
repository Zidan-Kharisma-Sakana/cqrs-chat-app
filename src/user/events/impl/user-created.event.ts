import { User } from 'src/user/entities/user.entity';

export class UserCreatedEvent {
  constructor(public readonly user: User) {}
}
