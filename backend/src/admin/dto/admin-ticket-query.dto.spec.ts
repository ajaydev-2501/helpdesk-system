import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AdminTicketQueryDto } from './admin-ticket-query.dto';
import { Priority, Status } from '@prisma/client';

describe('AdminTicketQueryDto', () => {
  it('should validate default query parameters', async () => {
    const dto = plainToInstance(AdminTicketQueryDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    expect(dto.sortBy).toBe('createdAt');
    expect(dto.sortOrder).toBe('desc');
  });

  it('should validate query with status, priority, and search by title', async () => {
    const dto = plainToInstance(AdminTicketQueryDto, {
      status: Status.IN_PROGRESS,
      priority: Priority.HIGH,
      search: 'Server outage',
      page: 2,
      limit: 20,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid status enum value', async () => {
    const dto = plainToInstance(AdminTicketQueryDto, {
      status: 'INVALID_STATUS' as unknown as Status,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid priority enum value', async () => {
    const dto = plainToInstance(AdminTicketQueryDto, {
      priority: 'URGENT' as unknown as Priority,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
