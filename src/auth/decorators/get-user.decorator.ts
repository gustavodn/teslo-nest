import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { GetUserDecoratorPayload } from '../interfaces/get-user-decorator-payload.interface';

export const GetUser = createParamDecorator(
  (data: GetUserDecoratorPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // check if the user is in the request object
    const user: User = request.user;
    if (!user) {
      throw new InternalServerErrorException('User not found (request)');
    }
    // if the criteria is in the user object, return the value
    if (data && data.criteria in user) {
      return request.user[data.criteria];
    }

    return request.user;
  },
);
