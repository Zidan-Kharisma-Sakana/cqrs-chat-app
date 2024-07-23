import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs';
import { User } from 'src/user/entities/user.entity';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserQuery } from 'src/user/query/impl/get-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly queryBus: QueryBus,
  ) {}

  async validateUser(userDto: LoginUserDto): Promise<User> {
    const user = await this.queryBus.execute(
      new GetUserQuery(
        {
          username: userDto.username,
        },
        [],
      ),
    );

    if (!user) {
      throw new NotFoundException(`There is no user under this username`);
    }

    const passwordEquals = await bcrypt.compare(
      userDto.password,
      user.password,
    );

    if (passwordEquals) return user;

    throw new UnauthorizedException({ message: 'Incorrect password' });
  }

  async verifyAccessToken(accessToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      return payload;
    } catch (err) {
      return null;
    }
  }

  verifyRefreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return payload;
  }

  async generateTokens(id: string) {
    const payload = { id };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: +process.env.JWT_ACCESS_EXPIRE,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: +process.env.JWT_REFRESH_EXPIRE,
    });
    const tokens = { accessToken, refreshToken };

    return tokens;
  }
}
