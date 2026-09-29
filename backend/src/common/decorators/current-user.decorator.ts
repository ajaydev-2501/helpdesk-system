import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SafeUser } from '@/users/dto';

/**
 * Parameter decorator to extract the authenticated user from the Request.
 * Example: @CurrentUser() user: SafeUser or @CurrentUser('email') email: string
 */
export const CurrentUser = createParamDecorator(
  (data: keyof SafeUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: SafeUser }>();
    const user = request.user;
    return data && user ? user[data] : user;
  },
);
