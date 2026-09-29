import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Status } from '@prisma/client';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  const mockAdminService = {
    findAllTickets: jest.fn(),
    getTicketStats: jest.fn(),
    updateTicketStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should call adminService.getTicketStats and return aggregate metrics', async () => {
      const stats = { total: 10, open: 4, inProgress: 4, resolved: 2 };
      mockAdminService.getTicketStats.mockResolvedValue(stats);

      const result = await controller.getStats();

      expect(service.getTicketStats).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });

  describe('findAll', () => {
    it('should call adminService.findAllTickets with query parameters', async () => {
      const paginated = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      };
      mockAdminService.findAllTickets.mockResolvedValue(paginated);

      const query = { page: 1, limit: 10, status: Status.OPEN };
      const result = await controller.findAll(query);

      expect(service.findAllTickets).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginated);
    });
  });

  describe('updateStatus', () => {
    it('should call adminService.updateTicketStatus with id and new status', async () => {
      const updated = { id: 'uuid-123', status: Status.IN_PROGRESS };
      mockAdminService.updateTicketStatus.mockResolvedValue(updated);

      const result = await controller.updateStatus('uuid-123', { status: Status.IN_PROGRESS });

      expect(service.updateTicketStatus).toHaveBeenCalledWith('uuid-123', Status.IN_PROGRESS);
      expect(result).toEqual(updated);
    });
  });
});
