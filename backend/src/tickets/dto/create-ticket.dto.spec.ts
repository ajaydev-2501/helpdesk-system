import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateTicketDto } from './create-ticket.dto';
import { Priority, Status } from '@prisma/client';

describe('CreateTicketDto', () => {
  it('should validate a valid ticket DTO with default priority and status', async () => {
    const dto = plainToInstance(CreateTicketDto, {
      title: 'Database connection timeout',
      description: 'Unable to connect to the primary replica due to network timeout.',
      category: 'Infrastructure',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate a valid ticket DTO with explicit priority and status', async () => {
    const dto = plainToInstance(CreateTicketDto, {
      title: 'Payment gateway failing',
      description: 'Customer transactions are being rejected with error code 500.',
      category: 'Billing',
      priority: Priority.HIGH,
      status: Status.OPEN,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail when title is missing or too short', async () => {
    const dto = plainToInstance(CreateTicketDto, {
      title: 'AB',
      description: 'Detailed description about the issue encountered.',
      category: 'Bug',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const titleError = errors.find((e) => e.property === 'title');
    expect(titleError).toBeDefined();
    expect(titleError?.constraints?.minComplexity || titleError?.constraints?.minLength).toBeDefined();
  });

  it('should fail when description is too short', async () => {
    const dto = plainToInstance(CreateTicketDto, {
      title: 'Valid Ticket Title',
      description: 'Too short',
      category: 'Support',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const descError = errors.find((e) => e.property === 'description');
    expect(descError).toBeDefined();
    expect(descError?.constraints?.minLength).toBeDefined();
  });

  it('should fail when category is missing', async () => {
    const dto = plainToInstance(CreateTicketDto, {
      title: 'Valid Ticket Title',
      description: 'This is a sufficiently long description for a support ticket.',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const catError = errors.find((e) => e.property === 'category');
    expect(catError).toBeDefined();
  });

  it('should fail when priority is invalid enum value', async () => {
    const dto = plainToInstance(CreateTicketDto, {
      title: 'Valid Ticket Title',
      description: 'This is a sufficiently long description for a support ticket.',
      category: 'General',
      priority: 'URGENT' as unknown as Priority,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const priorityError = errors.find((e) => e.property === 'priority');
    expect(priorityError).toBeDefined();
    expect(priorityError?.constraints?.isEnum).toBeDefined();
  });

  it('should fail when status is invalid enum value', async () => {
    const dto = plainToInstance(CreateTicketDto, {
      title: 'Valid Ticket Title',
      description: 'This is a sufficiently long description for a support ticket.',
      category: 'General',
      status: 'CLOSED' as unknown as Status,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const statusError = errors.find((e) => e.property === 'status');
    expect(statusError).toBeDefined();
    expect(statusError?.constraints?.isEnum).toBeDefined();
  });
});
