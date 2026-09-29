import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminTicketQueryDto, AdminTicketStatsDto } from './dto';
import { Status, Prisma } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves a paginated list of all system tickets for administrators.
   * Supports filtering by status, priority, and searching by ticket title.
   * Returns owner information: user id, user name, user email (never passwordHash).
   */
  async findAllTickets(query: AdminTicketQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: Prisma.TicketWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
      ...(query.search && {
        title: {
          contains: query.search,
          mode: 'insensitive',
        },
      }),
    };

    const validSortFields = ['createdAt', 'updatedAt', 'priority', 'status', 'title'];
    const sortBy: string =
      query.sortBy && validSortFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
    const sortOrder: Prisma.SortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: tickets,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Calculates overall ticket statistics directly from the database.
   */
  async getTicketStats(): Promise<AdminTicketStatsDto> {
    const [total, open, inProgress, resolved] = await Promise.all([
      this.prisma.ticket.count(),
      this.prisma.ticket.count({ where: { status: Status.OPEN } }),
      this.prisma.ticket.count({ where: { status: Status.IN_PROGRESS } }),
      this.prisma.ticket.count({ where: { status: Status.RESOLVED } }),
    ]);

    return {
      total,
      open,
      inProgress,
      resolved,
    };
  }

  /**
   * Updates the status of any ticket as an administrator.
   */
  async updateTicketStatus(id: string, status: Status) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" was not found`);
    }

    this.logger.log(`Admin updating ticket ${id} status from ${ticket.status} to ${status}`);

    return this.prisma.ticket.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
