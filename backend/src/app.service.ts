import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getRootInfo() {
    return {
      status: 'ok',
      name: 'Mini Helpdesk & Support Ticket System API',
      version: '1.0.0',
      environment: this.configService.get<string>('NODE_ENV', 'development'),
      docs: '/api/docs',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
