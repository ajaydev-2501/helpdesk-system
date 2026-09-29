import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
  AdminTicketQueryDto,
  AdminTicketStatsDto,
  UpdateTicketStatusDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { Roles } from '@/common/decorators';
import { Role } from '@prisma/client';
import { TicketResponseDto, PaginatedTicketsResponseDto } from '@/tickets/dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/tickets')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get system-wide ticket statistics (Admin only)',
    description:
      'Calculates total, open, in-progress, and resolved ticket counts directly from the database.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket statistics retrieved successfully',
    type: AdminTicketStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires ADMIN role',
  })
  async getStats(): Promise<AdminTicketStatsDto> {
    return this.adminService.getTicketStats();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all system tickets with owner info (Admin only)',
    description:
      'Retrieves a paginated list of all tickets across all users, with status/priority filters and title search.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated tickets list with owner details',
    type: PaginatedTicketsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires ADMIN role',
  })
  async findAll(@Query() query: AdminTicketQueryDto) {
    return this.adminService.findAllTickets(query);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update ticket status (Admin only)',
    description:
      'Allows an administrator to transition the status of any ticket to OPEN, IN_PROGRESS, or RESOLVED.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID of the ticket',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket status successfully updated',
    type: TicketResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or invalid UUID parameter',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires ADMIN role',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async updateStatus(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: string,
    @Body() updateDto: UpdateTicketStatusDto,
  ) {
    return this.adminService.updateTicketStatus(id, updateDto.status);
  }
}
