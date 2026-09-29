import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Priority, Status } from '@prisma/client';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;

  const mockTicket = {
    id: 'ticket-admin-123',
    title: 'DNS Resolution Error',
    description: 'Internal DNS servers are failing to resolve staging domain names.',
    category: 'Network',
    priority: Priority.HIGH,
    status: Status.OPEN,
    userId: 'user-xyz',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user-xyz',
      name: 'John Customer',
      email: 'john@example.com',
    },
  };

  const mockPrismaService = {
    ticket: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('findAllTickets', () => {
    it('should query all system tickets with pagination, filters, and owner info', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([mockTicket]);
      mockPrismaService.ticket.count.mockResolvedValue(1);

      const result = await service.findAllTickets({
        page: 1,
        limit: 10,
        status: Status.OPEN,
        priority: Priority.HIGH,
        search: 'DNS',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(prisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: Status.OPEN,
            priority: Priority.HIGH,
            title: {
              contains: 'DNS',
              mode: 'insensitive',
            },
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
          skip: 0,
          take: 10,
        }),
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].user).toBeDefined();
      expect(result.data[0].user.email).toBe('john@example.com');
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getTicketStats', () => {
    it('should aggregate ticket counts from database', async () => {
      mockPrismaService.ticket.count
        .mockResolvedValueOnce(35) // total
        .mockResolvedValueOnce(12) // open
        .mockResolvedValueOnce(15) // inProgress
        .mockResolvedValueOnce(8); // resolved

      const stats = await service.getTicketStats();

      expect(stats).toEqual({
        total: 35,
        open: 12,
        inProgress: 15,
        resolved: 8,
      });
      expect(prisma.ticket.count).toHaveBeenCalledTimes(4);
    });
  });

  describe('updateTicketStatus', () => {
    it('should update the status of any ticket', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      const updated = { ...mockTicket, status: Status.RESOLVED };
      mockPrismaService.ticket.update.mockResolvedValue(updated);

      const result = await service.updateTicketStatus(mockTicket.id, Status.RESOLVED);

      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: mockTicket.id },
        data: { status: Status.RESOLVED },
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
      expect(result.status).toBe(Status.RESOLVED);
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTicketStatus('non-existent-id', Status.RESOLVED),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
