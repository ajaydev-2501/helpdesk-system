import { ApiProperty } from '@nestjs/swagger';

export class AdminTicketStatsDto {
  @ApiProperty({
    example: 24,
    description: 'Total number of support tickets in the database',
  })
  total!: number;

  @ApiProperty({
    example: 10,
    description: 'Number of tickets with OPEN status',
  })
  open!: number;

  @ApiProperty({
    example: 8,
    description: 'Number of tickets with IN_PROGRESS status',
  })
  inProgress!: number;

  @ApiProperty({
    example: 6,
    description: 'Number of tickets with RESOLVED status',
  })
  resolved!: number;
}
