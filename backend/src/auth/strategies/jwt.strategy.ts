import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '@/users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { SafeUser } from '@/users/dto';

export const AUTH_COOKIE_NAME = 'access_token';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Primary: Extract from secure HTTP-only cookie
        (request: Request): string | null => {
          if (request && request.cookies) {
            return request.cookies[AUTH_COOKIE_NAME] || null;
          }
          return null;
        },
        // 2. Secondary fallback: Extract from standard Authorization Bearer header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret-key'),
    });
  }

  /**
   * Validates the decoded JWT payload and ensures the user exists.
   * Return value is attached by Passport to request.user.
   */
  async validate(payload: JwtPayload): Promise<SafeUser> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User account no longer exists or session is invalid');
    }
    return user;
  }
}
