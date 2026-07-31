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
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { TicketTypesService } from './ticket-types.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { AssignAllowedTicketTypesDto, UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('Ticket Types (Tipos de ingresso)')
@Controller({ path: 'ticket-types', version: '1' })
export class TicketTypesController {
  constructor(private readonly service: TicketTypesService) {}

  @Get('stats/count')
  @ApiOperation({ summary: 'Total de tipos de ingresso cadastrados' })
  async statsCount() {
    return { total: await this.service.countTotal() };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os tipos de ingresso' })
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhar tipo de ingresso + portões liberados' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Tipo de ingresso criado' })
  @ApiOperation({ summary: 'Criar um novo tipo de ingresso (autenticação obrigatória)' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTicketTypeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar tipo de ingresso' })
  update(@Param('id') id: string, @Body() dto: UpdateTicketTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Tipo excluído' })
  @ApiOperation({ summary: 'Excluir tipo de ingresso' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }

  @Put(':id/gates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'BE-BIZ-04 · Associar portões liberados (AllowedTicketType) a um tipo de ingresso',
  })
  assignGates(
    @Param('id') id: string,
    @Body() dto: AssignAllowedTicketTypesDto,
  ) {
    return this.service.assignGates(id, dto.ticketTypeIds ?? []);
  }
}
