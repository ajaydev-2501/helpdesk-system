import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SafeUser } from '@/users/dto';

/**
 * Guard that verifies the authenticated user possesses the role(s) specified by @Roles().
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no specific roles are defined, permit access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: SafeUser }>();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User authentication and role required');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient permissions: Required role [${requiredRoles.join(', ')}] but user has role "${user.role}"`,
      );
    }

    return true;
  }
}
