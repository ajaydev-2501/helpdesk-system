import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Priority, Status } from '@prisma/client';

export class TicketQueryDto {
  @ApiPropertyOptional({
    enum: Status,
    description: 'Filter tickets by status',
  })
  @IsOptional()
  @IsEnum(Status, { message: 'Status must be OPEN, IN_PROGRESS, or RESOLVED' })
  status?: Status;

  @ApiPropertyOptional({
    enum: Priority,
    description: 'Filter tickets by priority level',
  })
  @IsOptional()
  @IsEnum(Priority, { message: 'Priority must be LOW, MEDIUM, or HIGH' })
  priority?: Priority;

  @ApiPropertyOptional({
    example: 'Technical Support',
    description: 'Filter tickets by category',
  })
  @IsOptional()
  @IsString({ message: 'Category filter must be a string' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  category?: string;

  @ApiPropertyOptional({
    example: 'database',
    description: 'Full-text search query across ticket title and description',
  })
  @IsOptional()
  @IsString({ message: 'Search query must be a string' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;

  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
    description: 'Page number for paginated results',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    default: 10,
    minimum: 1,
    maximum: 100,
    description: 'Number of tickets per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: ['createdAt', 'updatedAt', 'priority', 'status', 'title'],
    default: 'createdAt',
    description: 'Field to sort tickets by',
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'priority', 'status', 'title'], {
    message: 'sortBy must be one of: createdAt, updatedAt, priority, status, title',
  })
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Sort direction',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsIn(['asc', 'desc'], { message: 'sortOrder must be either asc or desc' })
  sortOrder?: 'asc' | 'desc' = 'desc';

}
