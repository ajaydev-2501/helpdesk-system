import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateTicketDto } from './update-ticket.dto';
import { Priority, Status } from '@prisma/client';

describe('UpdateTicketDto', () => {
  it('should validate an empty update object', async () => {
    const dto = plainToInstance(UpdateTicketDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate partial updates', async () => {
    const dto = plainToInstance(UpdateTicketDto, {
      status: Status.IN_PROGRESS,
      priority: Priority.HIGH,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid priority in update', async () => {
    const dto = plainToInstance(UpdateTicketDto, {
      priority: 'INVALID_PRIORITY' as unknown as Priority,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid status in update', async () => {
    const dto = plainToInstance(UpdateTicketDto, {
      status: 'INVALID_STATUS' as unknown as Status,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
