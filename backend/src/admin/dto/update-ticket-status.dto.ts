import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Status } from '@prisma/client';

export class UpdateTicketStatusDto {
  @ApiProperty({
    enum: Status,
    example: Status.IN_PROGRESS,
    description: 'Updated ticket status',
  })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(Status, {
    message: 'Status must be OPEN, IN_PROGRESS, or RESOLVED',
  })
  status!: Status;
}
