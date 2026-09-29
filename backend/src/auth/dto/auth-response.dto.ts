import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto, SafeUser } from '@/users/dto';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Authenticated user profile without sensitive fields',
    type: UserResponseDto,
  })
  user!: SafeUser;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Bearer Access Token',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'Authentication successful',
    required: false,
  })
  message?: string;
}
