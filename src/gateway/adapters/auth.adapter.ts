import { INestApplicationContext } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { IoAdapter } from '@nestjs/platform-socket.io';

import { AuthService } from 'src/auth/auth.service';
import { GetUserQuery } from 'src/user/query/impl/get-user';

export class AuthIoAdapter extends IoAdapter {
  private readonly authService: AuthService;
  private readonly queryBus: QueryBus;

  constructor(private app: INestApplicationContext) {
    super(app);
    this.authService = this.app.get(AuthService);
    this.queryBus = this.app.get(QueryBus);
  }

  createIOServer(port: number, options?: any): any {
    options.allowRequest = async (request, allowFunction) => {
      const token = request._query?.token;
      const isVerified =
        token && (await this.authService.verifyAccessToken(token));
      const userExists =
        isVerified &&
        (await this.queryBus.execute(
          new GetUserQuery({ id: isVerified.id }, []),
        ));

      if (isVerified && userExists) {
        return allowFunction(null, true);
      }

      return allowFunction('Unauthorized', false);
    };

    return super.createIOServer(port, options);
  }
}
