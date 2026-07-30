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
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { JwtAuthGuardOptional } from '@/auth/guards/jwt-auth-optional.guard';
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
  @UseGuards(JwtAuthGuardOptional)
  @ApiBearerAuth()
  @ApiCreatedResponse({ description: 'Local criado' })
  @ApiOperation({ summary: 'Cadastrar novo local (autenticado opcional por enquanto)' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateVenueDto, @CurrentUser() user?: JwtUserPayload) {
    return this.venuesService.create(dto, user?.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuardOptional)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar local' })
  update(@Param('id') id: string, @Body() dto: UpdateVenueDto) {
    return this.venuesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuardOptional)
  @ApiBearerAuth()
  @ApiNoContentResponse({ description: 'Local excluído' })
  @ApiOperation({ summary: 'Excluir local (não se tiver eventos vinculados)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.venuesService.remove(id);
  }
}
