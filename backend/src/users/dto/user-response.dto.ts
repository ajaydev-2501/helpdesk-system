import { ApiProperty } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export type SafeUser = Omit<User, 'passwordHash'>;

export class UserResponseDto implements SafeUser {
  @ApiProperty({
    example: 'd8c7b89e-2144-46ab-bb12-984e723522dc',
    description: 'Unique identifier for the user',
  })
  id!: string;

  @ApiProperty({
    example: 'Jane Doe',
    description: 'Full name of the user',
  })
  name!: string;

  @ApiProperty({
    example: 'jane.doe@example.com',
    description: 'Email address of the user',
  })
  email!: string;

  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'Assigned role of the user',
  })
  role!: Role;

  @ApiProperty({
    example: '2026-09-29T11:00:00.000Z',
    description: 'Account creation timestamp',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-09-29T11:00:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt!: Date;

  @Exclude()
  passwordHash?: string;

  /**
   * Factory method to safely transform a Prisma User entity into SafeUser / UserResponseDto
   * guaranteeing passwordHash is stripped out.
   */
  static fromEntity(user: User): SafeUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _discarded, ...safeUser } = user;
    return safeUser;
  }
}
