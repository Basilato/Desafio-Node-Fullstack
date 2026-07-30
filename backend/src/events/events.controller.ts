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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuardOptional } from '@/auth/guards/jwt-auth-optional.guard';
import { CurrentUser, type JwtUserPayload } from '@/auth/decorators/current-user.decorator';

@ApiTags('Events (Eventos)')
@Controller({ path: 'events', version: '1' })
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('stats/count')
  @ApiOperation({ summary: 'Total de eventos cadastrados (p/ Dashboard)' })
  async statsCount() {
    const total = await this.eventsService.countTotal();
    return { total };
  }

  @Get('recent')
  @ApiOperation({ summary: 'Últimos eventos cadastrados (Dashboard)' })
  @ApiQuery({ name: 'limit', required: false, example: 3 })
  async recent(@Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit: number) {
    return this.eventsService.findRecent(limit);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Próximos eventos por data (Dashboard)' })
  @ApiQuery({ name: 'limit', required: false, example: 3 })
  async upcoming(@Query('limit', new DefaultValuePipe(3), ParseIntPipe) limit: number) {
    return this.eventsService.findUpcoming(limit);
  }

  @Get()
  @ApiOperation({ summary: 'Listar eventos (paginação + busca + filtros)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'venueId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'upcomingOnly', required: false })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perPage', new DefaultValuePipe(20), ParseIntPipe) perPage: number,
    @Query('search') search?: string,
    @Query('venueId') venueId?: string,
    @Query('category') category?: string,
    @Query('upcomingOnly') upcomingOnly?: string,
  ) {
    return this.eventsService.findAll({
      page,
      perPage,
      search,
      venueId,
      category,
      upcomingOnly: upcomingOnly === 'true' || upcomingOnly === '1',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar evento por ID' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuardOptional)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Evento criado (com validação de conflito de agenda)' })
  @ApiOperation({
    summary: 'Criar novo evento (RN-02: 1 local obrigatório | RN-04: sem conflito de agenda)',
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateEventDto, @CurrentUser() user?: JwtUserPayload) {
    return this.eventsService.create(dto, user?.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuardOptional)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar evento (mantém validação de conflito)' })
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardOptional)
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Evento excluído' })
  @ApiOperation({ summary: 'Excluir evento por ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.eventsService.remove(id);
  }
}
