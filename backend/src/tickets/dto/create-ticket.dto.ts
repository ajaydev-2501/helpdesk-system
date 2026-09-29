import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority, Status } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty({
    example: 'Unable to connect to database',
    description: 'A concise summary of the issue or support request',
    minLength: 3,
    maxLength: 150,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(150, { message: 'Title cannot exceed 150 characters' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title!: string;

  @ApiProperty({
    example: 'I am encountering connection timeout errors when trying to reach the database endpoint.',
    description: 'Detailed description of the issue, reproduction steps, or context',
    minLength: 10,
    maxLength: 5000,
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(5000, { message: 'Description cannot exceed 5000 characters' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  description!: string;

  @ApiProperty({
    example: 'Technical Support',
    description: 'Category categorization of the ticket',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Category must be a string' })
  @IsNotEmpty({ message: 'Category is required' })
  @MinLength(2, { message: 'Category must be at least 2 characters long' })
  @MaxLength(50, { message: 'Category cannot exceed 50 characters' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  category!: string;

  @ApiPropertyOptional({
    enum: Priority,
    default: Priority.MEDIUM,
    description: 'Priority level of the support ticket',
  })
  @IsOptional()
  @IsEnum(Priority, { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  priority?: Priority;

  @ApiPropertyOptional({
    enum: Status,
    default: Status.OPEN,
    description: 'Current status of the ticket',
  })
  @IsOptional()
  @IsEnum(Status, { message: 'Status must be OPEN, IN_PROGRESS, or RESOLVED' })
  status?: Status;
}
