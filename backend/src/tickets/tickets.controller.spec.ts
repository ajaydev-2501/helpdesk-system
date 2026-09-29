import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { Priority, Status, Role } from '@prisma/client';
import { SafeUser } from '@/users/dto';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: TicketsService;

  const mockUser: SafeUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'user@example.com',
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTicket = {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    title: 'Test Ticket',
    description: 'Detailed description',
    category: 'Technical',
    priority: Priority.MEDIUM,
    status: Status.OPEN,
    userId: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTicketsService = {
    create: jest.fn(),
    findAllForUser: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getModuleStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get<TicketsService>(TicketsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call ticketsService.create with DTO and currentUser.id', async () => {
      mockTicketsService.create.mockResolvedValue(mockTicket);

      const dto = {
        title: 'Test Ticket',
        description: 'Detailed description',
        category: 'Technical',
      };

      const result = await controller.create(mockUser, dto);

      expect(service.create).toHaveBeenCalledWith(dto, mockUser.id);
      expect(result).toEqual(mockTicket);
    });
  });

  describe('findAll', () => {
    it('should call ticketsService.findAllForUser with currentUser.id and query params', async () => {
      const paginated = {
        data: [mockTicket],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
      mockTicketsService.findAllForUser.mockResolvedValue(paginated);

      const query = { page: 1, limit: 10, status: Status.OPEN };
      const result = await controller.findAll(mockUser, query);

      expect(service.findAllForUser).toHaveBeenCalledWith(mockUser.id, query);
      expect(result).toEqual(paginated);
    });
  });

  describe('findOne', () => {
    it('should call ticketsService.findOne with ticket ID and currentUser', async () => {
      mockTicketsService.findOne.mockResolvedValue(mockTicket);

      const result = await controller.findOne(mockTicket.id, mockUser);

      expect(service.findOne).toHaveBeenCalledWith(mockTicket.id, mockUser);
      expect(result).toEqual(mockTicket);
    });
  });

  describe('update', () => {
    it('should call ticketsService.update with ID, DTO, and currentUser', async () => {
      const updated = { ...mockTicket, status: Status.IN_PROGRESS };
      mockTicketsService.update.mockResolvedValue(updated);

      const updateDto = { status: Status.IN_PROGRESS };
      const result = await controller.update(mockTicket.id, mockUser, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockTicket.id, updateDto, mockUser);
      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('should call ticketsService.delete with ID and currentUser', async () => {
      const deleteResult = { message: 'Ticket deleted successfully', id: mockTicket.id };
      mockTicketsService.delete.mockResolvedValue(deleteResult);

      const result = await controller.delete(mockTicket.id, mockUser);

      expect(service.delete).toHaveBeenCalledWith(mockTicket.id, mockUser);
      expect(result).toEqual(deleteResult);
    });
  });

  describe('getStatus', () => {
    it('should return module status', () => {
      mockTicketsService.getModuleStatus.mockReturnValue({
        module: 'TicketsModule',
        status: 'active',
        timestamp: new Date().toISOString(),
      });

      const result = controller.getStatus();
      expect(result.module).toBe('TicketsModule');
    });
  });
});
