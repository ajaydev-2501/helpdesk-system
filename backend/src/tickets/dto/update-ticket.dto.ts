import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Priority, Status } from '@prisma/client';

export class UpdateTicketDto {
  @ApiPropertyOptional({
    example: 'Updated ticket title',
    description: 'Updated concise summary of the issue',
    minLength: 3,
    maxLength: 150,
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(150, { message: 'Title cannot exceed 150 characters' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title?: string;

  @ApiPropertyOptional({
    example: 'Updated comprehensive description of the problem with recent logs.',
    description: 'Updated detailed description of the ticket',
    minLength: 10,
    maxLength: 5000,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(5000, { message: 'Description cannot exceed 5000 characters' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  description?: string;

  @ApiPropertyOptional({
    example: 'Billing Support',
    description: 'Updated category of the ticket',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  @MinLength(2, { message: 'Category must be at least 2 characters long' })
  @MaxLength(50, { message: 'Category cannot exceed 50 characters' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  category?: string;

  @ApiPropertyOptional({
    enum: Priority,
    description: 'Updated priority level of the ticket',
  })
  @IsOptional()
  @IsEnum(Priority, { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  priority?: Priority;

  @ApiPropertyOptional({
    enum: Status,
    description: 'Updated status of the ticket',
  })
  @IsOptional()
  @IsEnum(Status, { message: 'Status must be OPEN, IN_PROGRESS, or RESOLVED' })
  status?: Status;
}
