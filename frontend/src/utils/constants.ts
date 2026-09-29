export const APP_CONFIG = {
  APP_NAME: 'Mini Helpdesk & Support Ticket System',
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 10,
  SUPPORT_EMAIL: 'support@example.com',
} as const;

export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;
