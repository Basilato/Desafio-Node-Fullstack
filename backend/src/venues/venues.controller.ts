import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
  DefaultValuePipe,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { AssignAllowedTicketTypesDto } from '@/ticket-types/dto/update-ticket-type.dto';
import { AssignGatesTicketTypesDto } from './dto/assign-gates.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import type { JwtUserPayload } from '@/auth/auth.service';

@ApiTags('Venues (Locais)')
@Controller({ path: 'venues', version: '1' })
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Get('stats/count')
  @ApiOperation({ summary: 'Total de locais cadastrados (p/ Dashboard)' })
  async statsCount() {
    const total = await this.venuesService.countTotal();
    return { total };
  }

  @Get('recent')
  @ApiOperation({ summary: 'Últimos locais cadastrados (Dashboard)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 3 })
  async recent(@Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit: number) {
    return this.venuesService.findRecent(limit);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os locais (paginação + busca)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perPage', new DefaultValuePipe(20), ParseIntPipe) perPage: number,
    @Query('search') search?: string,
  ) {
    return this.venuesService.findAll({ page, perPage, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar um local por ID' })
  findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Local criado' })
  @ApiOperation({ summary: 'Cadastrar novo local (autenticação obrigatória)' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateVenueDto, @CurrentUser() user?: JwtUserPayload) {
    return this.venuesService.create(dto, user?.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar local (autenticação obrigatória)' })
  update(@Param('id') id: string, @Body() dto: UpdateVenueDto) {
    return this.venuesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Local excluído' })
  @ApiOperation({ summary: 'Excluir local (autenticação obrigatória, não se tiver eventos vinculados)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.venuesService.remove(id);
  }

  @Put(':venueId/gates/:gateId/allowed-ticket-types')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'BE-BIZ-04 · Associar Tipos de Ingresso LIBERADOS a um Portão (catraca) específico de um Local',
  })
  assignGateTicketTypes(
    @Param('venueId') venueId: string,
    @Param('gateId') gateId: string,
    @Body() dto: AssignAllowedTicketTypesDto,
  ) {
    return this.venuesService.assignGateAllowedTicketTypes({
      venueId,
      gateId,
      ticketTypeIds: dto.ticketTypeIds ?? [],
    });
  }

  @Post(':venueId/gates/allowed-ticket-types/bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'BE-BIZ-04 · LOTE · Atualizar liberações de Tipos de Ingresso em MÚLTIPLOS Portões de um Local de uma vez',
  })
  assignBulkGateTicketTypes(
    @Param('venueId') venueId: string,
    @Body() dto: AssignGatesTicketTypesDto,
  ) {
    return this.venuesService.assignBulkGateAllowedTicketTypes({
      venueId,
      assignments: dto.assignments,
    });
  }
}
