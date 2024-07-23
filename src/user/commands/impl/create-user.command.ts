import { CreateUserDto } from 'src/user/dto/create-user.dto';

export class CreateUserCommand {
  constructor(public readonly dto: CreateUserDto) {}
}
