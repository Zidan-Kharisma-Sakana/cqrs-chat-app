import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from './interfaces/jwt-payload.interface';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserQuery } from 'src/user/query/impl/get-user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly queryBus: QueryBus) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.queryBus.execute(
      new GetUserQuery(
        {
          id: payload.id,
        },
        [],
      ),
    );

    return user;
  }
}
