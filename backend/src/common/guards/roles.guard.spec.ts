import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(reflector);
  });

  function createMockContext(user?: { role?: Role }) {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow access if no roles are required on the endpoint', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const context = createMockContext({ role: Role.USER });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow access if user has the required role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    const context = createMockContext({ role: Role.ADMIN });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user has a different role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    const context = createMockContext({ role: Role.USER });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(context)).toThrow(
      'Insufficient permissions: Required role [ADMIN] but user has role "USER"',
    );
  });

  it('should throw ForbiddenException if user is not present or has no role', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.USER]);

    const context = createMockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
