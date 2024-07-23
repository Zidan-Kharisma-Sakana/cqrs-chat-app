import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { AuthService } from './auth.service';

import { LocalAuthGuard } from './guards/local-auth.guard';

import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginUserDto } from 'src/user/dto/login-user.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from 'src/user/commands/impl/create-user.command';
import { GetUserQuery } from 'src/user/query/impl/get-user';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('/signUp')
  async singUp(
    @Body() userDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.commandBus.execute(new CreateUserCommand(userDto));
    const tokens = await this.authService.generateTokens(user.id);
    console.log('Create new user');
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return tokens;
  }

  @Post('/signIn')
  @UseGuards(LocalAuthGuard)
  async singIn(
    @Body() userDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.queryBus.execute(
      new GetUserQuery(
        {
          username: userDto.username,
        },
        [],
      ),
    );
    const tokens = await this.authService.generateTokens(user.id);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return tokens;
  }

  @Post('/refresh')
  async updateTokens(@Req() req: Request) {
    const { refreshToken } = req.cookies;
    try {
      const payload = this.authService.verifyRefreshToken(refreshToken);
      const { accessToken } = await this.authService.generateTokens(payload.id);
      return { accessToken };
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }
}
