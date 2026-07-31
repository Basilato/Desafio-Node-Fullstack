import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GatesService } from './gates.service';
import { CreateGateDto } from './dto/create-gate.dto';
import { UpdateGateDto } from './dto/update-gate.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { JwtAuthGuardOptional } from '@/auth/guards/jwt-auth-optional.guard';

@ApiTags('Gates (Portões)')
@Controller({ path: 'gates', version: '1' })
export class GatesController {
  constructor(private readonly service: GatesService) {}

  @Get('stats/count')
  @ApiOperation({ summary: 'Total de portões (opcionalmente por venueId)' })
  async statsCount() {
    return { total: await this.service.countByVenue() };
  }

  @Get('venue/:venueId')
  @UseGuards(JwtAuthGuardOptional)
  @ApiOperation({ summary: 'Listar todos os portões de um local' })
  listByVenue(@Param('venueId') venueId: string) {
    return this.service.listByVenue(venueId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuardOptional)
  @ApiOperation({ summary: 'Detalhar um portão por ID (inclui venue + tipos permitidos)' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('venue/:venueId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Portão criado' })
  @ApiOperation({ summary: 'Criar um novo portão associado a um local (autenticação obrigatória)' })
  @HttpCode(HttpStatus.CREATED)
  create(@Param('venueId') venueId: string, @Body() dto: CreateGateDto) {
    return this.service.create(venueId, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar dados de um portão' })
  update(@Param('id') id: string, @Body() dto: UpdateGateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Portão excluído' })
  @ApiOperation({ summary: 'Excluir um portão (remove também associações de tipos de ingresso)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
  }
}
