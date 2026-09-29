import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { TicketsService } from './tickets.service';
import {
  CreateTicketDto,
  UpdateTicketDto,
  TicketQueryDto,
  TicketResponseDto,
  PaginatedTicketsResponseDto,
} from './dto';
import { JwtAuthGuard } from '@/common/guards';
import { CurrentUser } from '@/common/decorators';
import { SafeUser } from '@/users/dto';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify tickets module status',
    description: 'Returns the operational status of the TicketsModule for verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tickets module is active and initialized',
  })
  getStatus() {
    return this.ticketsService.getModuleStatus();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new support ticket',
    description:
      'Creates a new ticket owned by the authenticated user. Ownership is inferred exclusively from JWT token.',
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    type: TicketResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or validation failure',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async create(
    @CurrentUser() currentUser: SafeUser,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.ticketsService.create(createTicketDto, currentUser.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List tickets owned by the authenticated user',
    description:
      'Returns a paginated list of tickets owned exclusively by the caller, with optional filters and search.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated ticket results',
    type: PaginatedTicketsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async findAll(
    @CurrentUser() currentUser: SafeUser,
    @Query() query: TicketQueryDto,
  ) {
    return this.ticketsService.findAllForUser(currentUser.id, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get ticket details by ID',
    description:
      'Retrieves full details for a ticket. Users may only access their own tickets; Admins may access any ticket.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID of the ticket',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket details retrieved successfully',
    type: TicketResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID parameter format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - caller does not own this ticket and is not an Admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: string,
    @CurrentUser() currentUser: SafeUser,
  ) {
    return this.ticketsService.findOne(id, currentUser);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update an existing ticket',
    description:
      'Updates ticket fields with ownership validation. Users may only update their own tickets; Admins may update any ticket.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID of the ticket to update',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket updated successfully',
    type: TicketResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or invalid UUID format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - caller does not own this ticket and is not an Admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: string,
    @CurrentUser() currentUser: SafeUser,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(id, updateTicketDto, currentUser);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a ticket',
    description:
      'Permanently deletes a ticket with ownership validation. Users may only delete their own tickets; Admins may delete any ticket.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID of the ticket to delete',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @ApiResponse({
    status: 200,
    description: 'Ticket deleted successfully',
    schema: {
      example: {
        message: 'Ticket deleted successfully',
        id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID parameter format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - caller does not own this ticket and is not an Admin',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async delete(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }))
    id: string,
    @CurrentUser() currentUser: SafeUser,
  ) {
    return this.ticketsService.delete(id, currentUser);
  }
}
