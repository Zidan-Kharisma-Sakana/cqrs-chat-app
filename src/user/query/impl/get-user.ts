import { User } from 'src/user/entities/user.entity';
import { FindOptionsWhere } from 'typeorm';

export class GetUserQuery {
  constructor(
    public readonly condition: FindOptionsWhere<User>,
    public readonly relations: string[],
  ) {}
}
