import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority, Status } from '@prisma/client';

export class TicketUserSummaryDto {
  @ApiProperty({ example: 'b9d3e8e1-0c5a-4b9b-8d6f-87d2efb45678' })
  id!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'john@example.com' })
  email!: string;
}

export class TicketResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id!: string;

  @ApiProperty({ example: 'Unable to connect to database' })
  title!: string;

  @ApiProperty({ example: 'I am encountering connection timeout errors when trying to reach the database endpoint.' })
  description!: string;

  @ApiProperty({ example: 'Technical Support' })
  category!: string;

  @ApiProperty({ enum: Priority, example: Priority.MEDIUM })
  priority!: Priority;

  @ApiProperty({ enum: Status, example: Status.OPEN })
  status!: Status;

  @ApiProperty({ example: 'b9d3e8e1-0c5a-4b9b-8d6f-87d2efb45678' })
  userId!: string;

  @ApiProperty({ example: '2026-09-29T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-29T12:00:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ type: () => TicketUserSummaryDto })
  user?: TicketUserSummaryDto;
}

export class TicketPaginationMetaDto {
  @ApiProperty({ example: 42, description: 'Total number of items matching filters' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  limit!: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  totalPages!: number;

  @ApiProperty({ example: true, description: 'Whether a subsequent page exists' })
  hasNextPage!: boolean;

  @ApiProperty({ example: false, description: 'Whether a prior page exists' })
  hasPrevPage!: boolean;
}

export class PaginatedTicketsResponseDto {
  @ApiProperty({ type: [TicketResponseDto] })
  data!: TicketResponseDto[];

  @ApiProperty({ type: TicketPaginationMetaDto })
  meta!: TicketPaginationMetaDto;
}
