import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto, SafeUser, UserResponseDto } from './dto';
import { hashPassword } from '@/common/utils/password.util';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Creates a new user with secure password hashing and duplicate prevention.
   * Never returns or exposes the passwordHash.
   */
  async createUser(dto: CreateUserDto): Promise<SafeUser> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    // Check for existing user to prevent duplicate email registrations
    const existingUser = await this.usersRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      this.logger.warn(`Registration rejected: Email already in use (${normalizedEmail})`);
      throw new ConflictException('A user with this email address already exists');
    }

    // Hash the password securely using bcrypt
    const passwordHash = await hashPassword(dto.password);

    // Save user record
    const createdUser = await this.usersRepository.create({
      name: dto.name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: dto.role,
    });

    this.logger.log(`Created user successfully: ${createdUser.email} [${createdUser.id}]`);

    // Return safe user object omitting passwordHash
    return UserResponseDto.fromEntity(createdUser);
  }

  /**
   * Retrieves a user by their unique ID, omitting sensitive fields.
   */
  async findById(id: string): Promise<SafeUser | null> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      return null;
    }
    return UserResponseDto.fromEntity(user);
  }

  /**
   * Retrieves a user by their unique ID, throwing a NotFoundException if not found.
   */
  async findByIdOrThrow(id: string): Promise<SafeUser> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" was not found`);
    }
    return user;
  }

  /**
   * Retrieves a user by email, omitting sensitive fields.
   */
  async findByEmail(email: string): Promise<SafeUser | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersRepository.findByEmail(normalizedEmail);
    if (!user) {
      return null;
    }
    return UserResponseDto.fromEntity(user);
  }

  /**
   * Internal lookup method for authentication services to verify passwords.
   * This is explicitly named to ensure passwordHash is never accidentally exposed in public handlers.
   */
  async findUserWithPasswordByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    return this.usersRepository.findByEmail(normalizedEmail);
  }

  /**
   * Retrieves all users as SafeUser objects.
   */
  async findAll(): Promise<SafeUser[]> {
    const users = await this.usersRepository.findAll();
    return users.map((user) => UserResponseDto.fromEntity(user));
  }
}
