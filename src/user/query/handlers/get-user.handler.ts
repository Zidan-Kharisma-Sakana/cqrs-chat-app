import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { GetUserQuery } from '../impl/get-user';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async execute(query: GetUserQuery) {
    const user = await this.userRepository.findOne({
      where: query.condition,
      relations: query.relations,
    });
    if (!user) {
      throw new NotFoundException(`There is no user`);
    }
    return user;
  }
}
