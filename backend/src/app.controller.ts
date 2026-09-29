import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API Root Information' })
  @ApiResponse({ status: 200, description: 'Returns API system information' })
  getRootInfo() {
    return this.appService.getRootInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health Check' })
  @ApiResponse({ status: 200, description: 'Returns system health status' })
  getHealth() {
    return this.appService.getHealth();
  }
}
