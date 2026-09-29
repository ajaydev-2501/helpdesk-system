import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateTicketStatusDto } from './update-ticket-status.dto';
import { Status } from '@prisma/client';

describe('UpdateTicketStatusDto', () => {
  it('should validate valid status transitions', async () => {
    for (const status of [Status.OPEN, Status.IN_PROGRESS, Status.RESOLVED]) {
      const dto = plainToInstance(UpdateTicketStatusDto, { status });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });

  it('should fail when status is missing', async () => {
    const dto = plainToInstance(UpdateTicketStatusDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });

  it('should fail when status is invalid enum', async () => {
    const dto = plainToInstance(UpdateTicketStatusDto, { status: 'CANCELLED' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
