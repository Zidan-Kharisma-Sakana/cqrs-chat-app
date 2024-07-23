import { CreateUserCommand } from '../impl/create-user.command';
import { ICommandHandler, CommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
// import { UserCreatedEvent } from 'src/user/events/impl/user-created.event';
import * as bcrypt from 'bcryptjs';
import { AuthService } from 'src/auth/auth.service';
import { UserCreatedEvent } from 'src/user/events/impl/user-created.event';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly authService: AuthService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateUserCommand) {
    const { username, email, password } = command.dto;
    const hashedPassword = await bcrypt.hash(password, 7);

    let user = this.userRepository.create({
      email: email,
      username: username,
      password: hashedPassword,
    });

    user = await this.userRepository.save(user);
    const tokens = await this.authService.generateTokens(user.id);
    this.eventBus.publish(new UserCreatedEvent(user));
    return tokens;
  }
}
