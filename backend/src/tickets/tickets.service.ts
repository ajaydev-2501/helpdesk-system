import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  TicketQueryDto,
  PaginatedTicketsResponseDto,
} from './dto';
import { SafeUser } from '@/users/dto';
import { Priority, Status, Role, Prisma } from '@prisma/client';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new support ticket for the authenticated user.
   * Forces ownership to the authenticated userId.
   * Priority defaults to MEDIUM and status defaults to OPEN.
   */
  async create(createTicketDto: CreateTicketDto, userId: string) {
    this.logger.log(`Creating ticket for user ${userId}: "${createTicketDto.title}"`);

    return this.prisma.ticket.create({
      data: {
        title: createTicketDto.title,
        description: createTicketDto.description,
        category: createTicketDto.category,
        priority: createTicketDto.priority ?? Priority.MEDIUM,
        status: createTicketDto.status ?? Status.OPEN,
        userId,
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
    });
  }

  /**
   * Retrieves a paginated list of tickets owned by the authenticated user.
   * Supports filtering by status, priority, category, and text search.
   */
  async findAllForUser(
    userId: string,
    query: TicketQueryDto,
  ): Promise<PaginatedTicketsResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    // Build Prisma where clause strictly scoped to the authenticated user
    const where: Prisma.TicketWhereInput = {
      userId,
      ...(query.status && { status: query.status }),
      ...(query.priority && { priority: query.priority }),
      ...(query.category && {
        category: {
          contains: query.category,
          mode: 'insensitive',
        },
      }),
      ...(query.search && {
        OR: [
          {
            title: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const validSortFields = ['createdAt', 'updatedAt', 'priority', 'status', 'title'];
    const sortBy: string = query.sortBy && validSortFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
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
   * Retrieves a single ticket by ID with strict ownership/role verification.
   * - USER role: Can only retrieve tickets where ticket.userId === currentUser.id
   * - ADMIN role: Can retrieve any ticket
   */
  async findOne(id: string, currentUser: SafeUser) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
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

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" was not found`);
    }

    // Enforce authorization: USER can only access their own ticket
    if (currentUser.role !== Role.ADMIN && ticket.userId !== currentUser.id) {
      this.logger.warn(
        `User ${currentUser.id} attempted unauthorized access to ticket ${id} owned by ${ticket.userId}`,
      );
      throw new ForbiddenException('You do not have permission to access this ticket');
    }

    return ticket;
  }

  /**
   * Updates an existing ticket with ownership verification.
   * - USER role: Can update their own tickets
   * - ADMIN role: Can update any ticket
   */
  async update(id: string, updateTicketDto: UpdateTicketDto, currentUser: SafeUser) {
    const existingTicket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      throw new NotFoundException(`Ticket with ID "${id}" was not found`);
    }

    // Enforce ownership
    if (currentUser.role !== Role.ADMIN && existingTicket.userId !== currentUser.id) {
      this.logger.warn(
        `User ${currentUser.id} attempted unauthorized update on ticket ${id} owned by ${existingTicket.userId}`,
      );
      throw new ForbiddenException('You do not have permission to update this ticket');
    }

    return this.prisma.ticket.update({
      where: { id },
      data: {
        ...(updateTicketDto.title !== undefined && { title: updateTicketDto.title }),
        ...(updateTicketDto.description !== undefined && {
          description: updateTicketDto.description,
        }),
        ...(updateTicketDto.category !== undefined && { category: updateTicketDto.category }),
        ...(updateTicketDto.priority !== undefined && { priority: updateTicketDto.priority }),
        ...(updateTicketDto.status !== undefined && { status: updateTicketDto.status }),
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
    });
  }

  /**
   * Deletes a ticket with ownership verification.
   * - USER role: Can delete their own tickets
   * - ADMIN role: Can delete any ticket
   */
  async delete(id: string, currentUser: SafeUser) {
    const existingTicket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!existingTicket) {
      throw new NotFoundException(`Ticket with ID "${id}" was not found`);
    }

    // Enforce ownership
    if (currentUser.role !== Role.ADMIN && existingTicket.userId !== currentUser.id) {
      this.logger.warn(
        `User ${currentUser.id} attempted unauthorized deletion on ticket ${id} owned by ${existingTicket.userId}`,
      );
      throw new ForbiddenException('You do not have permission to delete this ticket');
    }

    await this.prisma.ticket.delete({
      where: { id },
    });

    this.logger.log(`Ticket ${id} successfully deleted by user ${currentUser.id}`);

    return {
      message: 'Ticket deleted successfully',
      id,
    };
  }

  /**
   * Health and module verification check
   */
  getModuleStatus(): { module: string; status: string; timestamp: string } {
    return {
      module: 'TicketsModule',
      status: 'active',
      timestamp: new Date().toISOString(),
    };
  }
}
