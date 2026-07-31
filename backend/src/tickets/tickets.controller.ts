import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ListTicketsByEventDto } from './dto/list-tickets.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('Tickets (Ingressos)')
@Controller({ path: 'tickets', version: '1' })
export class TicketsController {
  constructor(private readonly service: TicketsService) {}

  @Get('stats/count')
  @ApiOperation({ summary: 'Total de ingressos emitidos (Dashboard)' })
  async statsCount() {
    return { total: await this.service.countTotal() };
  }

  @Get('event/:eventId/capacity')
  @ApiOperation({
    summary:
      'BE-BIZ-02 · Capacidade do venue vs ingressos vendidos, agrupados por tipo/status',
  })
  eventCapacity(@Param('eventId') eventId: string) {
    return this.service.getEventCapacity(eventId);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Listar ingressos de um evento (com filtros opcionais)' })
  findByEvent(
    @Param('eventId') eventId: string,
    @Query() filters: ListTicketsByEventDto,
  ) {
    return this.service.findByEvent(eventId, filters);
  }

  @Get('event/:eventId/breakdown')
  @ApiOperation({ summary: 'Contagem de ingressos por status em um evento' })
  breakdown(@Param('eventId') eventId: string) {
    return this.service.statusBreakdownByEvent(eventId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar ingresso por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Ingresso emitido' })
  @ApiOperation({
    summary:
      'BE-APP-05 · Emitir ingresso (autenticação obrigatória) respeitando capacidade do venue',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTicketDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar dados ou status do ingresso' })
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Ingresso cancelado' })
  @ApiOperation({ summary: 'Cancelar um ingresso (status → CANCELLED)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}
