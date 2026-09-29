import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { UsersService } from '@/users/users.service';
import { verifyPassword } from '@/common/utils/password.util';
import { SafeUser } from '@/users/dto';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new standard USER account.
   * Enforces role=USER and ensures passwordHash is never returned.
   */
  async register(dto: RegisterDto): Promise<SafeUser> {
    this.logger.log(`Processing registration for email: ${dto.email}`);
    return this.usersService.createUser({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: Role.USER,
    });
  }

  /**
   * Validates user credentials against stored bcrypt hash.
   * Returns SafeUser if valid, or null if credentials do not match.
   */
  async validateUser(email: string, pass: string): Promise<SafeUser | null> {
    const user = await this.usersService.findUserWithPasswordByEmail(email);
    if (!user) {
      this.logger.warn(`Authentication failed: User not found for email ${email}`);
      return null;
    }

    const isMatch = await verifyPassword(pass, user.passwordHash);
    if (!isMatch) {
      this.logger.warn(`Authentication failed: Password mismatch for email ${email}`);
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _discarded, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Generates a signed JWT containing ONLY the required claims: sub, email, role.
   */
  async generateToken(user: SafeUser): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Authenticates user and returns sanitized profile and signed JWT token.
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.generateToken(user);

    this.logger.log(`User logged in successfully: ${user.email} [${user.role}]`);

    return {
      user,
      accessToken,
      message: 'Authentication successful',
    };
  }
}
