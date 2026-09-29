import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Priority, Status, Role } from '@prisma/client';
import { SafeUser } from '@/users/dto';

describe('TicketsService', () => {
  let service: TicketsService;
  let prisma: PrismaService;

  const userA: SafeUser = {
    id: 'user-a-111',
    name: 'User A',
    email: 'user-a@example.com',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const userB: SafeUser = {
    id: 'user-b-222',
    name: 'User B',
    email: 'user-b@example.com',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const adminUser: SafeUser = {
    id: 'admin-999',
    name: 'Admin User',
    email: 'admin@example.com',
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTicket = {
    id: 'ticket-123',
    title: 'Test Ticket',
    description: 'Detailed description of the issue',
    category: 'Billing',
    priority: Priority.MEDIUM,
    status: Status.OPEN,
    userId: 'user-a-111',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    ticket: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a ticket with forced userId and default values', async () => {
      mockPrismaService.ticket.create.mockResolvedValue(mockTicket);

      const result = await service.create(
        {
          title: 'Test Ticket',
          description: 'Detailed description of the issue',
          category: 'Billing',
        },
        userA.id,
      );

      expect(prisma.ticket.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Ticket',
          description: 'Detailed description of the issue',
          category: 'Billing',
          priority: Priority.MEDIUM,
          status: Status.OPEN,
          userId: userA.id,
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
      expect(result).toEqual(mockTicket);
    });
  });

  describe('findAllForUser', () => {
    it('should query tickets scoped strictly to the given userId with pagination', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([mockTicket]);
      mockPrismaService.ticket.count.mockResolvedValue(1);

      const result = await service.findAllForUser(userA.id, {
        page: 1,
        limit: 10,
        status: Status.OPEN,
        priority: Priority.MEDIUM,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: userA.id,
            status: Status.OPEN,
            priority: Priority.MEDIUM,
          }),
          skip: 0,
          take: 10,
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should include case-insensitive search in title or description', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([]);
      mockPrismaService.ticket.count.mockResolvedValue(0);

      await service.findAllForUser(userA.id, {
        page: 1,
        limit: 10,
        search: 'database',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: userA.id,
            OR: [
              { title: { contains: 'database', mode: 'insensitive' } },
              { description: { contains: 'database', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return ticket when caller is the ticket owner', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      const result = await service.findOne(mockTicket.id, userA);
      expect(result).toEqual(mockTicket);
    });

    it('should return ticket when caller is an ADMIN even if not the owner', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      const result = await service.findOne(mockTicket.id, adminUser);
      expect(result).toEqual(mockTicket);
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id', userA)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user tries to access another users ticket', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket); // owned by user-a

      await expect(service.findOne(mockTicket.id, userB)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update ticket when caller is the owner', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      const updated = { ...mockTicket, title: 'Updated Title' };
      mockPrismaService.ticket.update.mockResolvedValue(updated);

      const result = await service.update(
        mockTicket.id,
        { title: 'Updated Title' },
        userA,
      );

      expect(result.title).toBe('Updated Title');
    });

    it('should allow ADMIN to update another users ticket', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      const updated = { ...mockTicket, status: Status.RESOLVED };
      mockPrismaService.ticket.update.mockResolvedValue(updated);

      const result = await service.update(
        mockTicket.id,
        { status: Status.RESOLVED },
        adminUser,
      );

      expect(result.status).toBe(Status.RESOLVED);
    });

    it('should throw ForbiddenException if regular user attempts to update another users ticket', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      await expect(
        service.update(mockTicket.id, { title: 'Hack attempt' }, userB),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if ticket to update does not exist', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(
        service.update('missing-id', { title: 'Updated' }, userA),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete ticket when caller is the owner', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.ticket.delete.mockResolvedValue(mockTicket);

      const result = await service.delete(mockTicket.id, userA);
      expect(result).toHaveProperty('message', 'Ticket deleted successfully');
      expect(result).toHaveProperty('id', mockTicket.id);
    });

    it('should allow ADMIN to delete any ticket', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.ticket.delete.mockResolvedValue(mockTicket);

      const result = await service.delete(mockTicket.id, adminUser);
      expect(result).toHaveProperty('message', 'Ticket deleted successfully');
    });

    it('should throw ForbiddenException if non-owner regular user attempts deletion', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      await expect(service.delete(mockTicket.id, userB)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(service.delete('missing-id', userA)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
