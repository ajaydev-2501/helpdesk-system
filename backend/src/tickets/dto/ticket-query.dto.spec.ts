import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { TicketQueryDto } from './ticket-query.dto';
import { Priority, Status } from '@prisma/client';

describe('TicketQueryDto', () => {
  it('should validate default query DTO values', async () => {
    const dto = plainToInstance(TicketQueryDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
    expect(dto.sortBy).toBe('createdAt');
    expect(dto.sortOrder).toBe('desc');
  });

  it('should validate custom filter parameters', async () => {
    const dto = plainToInstance(TicketQueryDto, {
      status: Status.RESOLVED,
      priority: Priority.LOW,
      category: 'Billing',
      search: 'invoice',
      page: 2,
      limit: 25,
      sortBy: 'priority',
      sortOrder: 'asc',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid page or limit', async () => {
    const dto = plainToInstance(TicketQueryDto, {
      page: 0,
      limit: 200,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid sortBy field', async () => {
    const dto = plainToInstance(TicketQueryDto, {
      sortBy: 'unsupportedField',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
