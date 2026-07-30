import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { Prisma } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const EVENT_INCLUDES = {
  venue: { select: { id: true, name: true, city: true, state: true, capacity: true } },
  createdBy: { select: { id: true, name: true, email: true, role: true } },
  tickets: { take: 10, include: { ticketType: true } },
  _count: { select: { tickets: true } },
} satisfies Prisma.EventInclude;

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * REGRA DE NEGÓCIO NÃO-NEGOCIÁVEL #4:
   * Não pode haver dois eventos no mesmo local com intervalo de tempo sobreposto.
   * (RN-04 da especificação)
   */
  private async assertNoScheduleConflict(params: {
    venueId: string;
    startDate: Date;
    endDate: Date;
    excludeEventId?: string;
  }): Promise<void> {
    const { venueId, startDate, endDate, excludeEventId } = params;

    if (endDate.getTime() <= startDate.getTime()) {
      throw new BadRequestException('endDate deve ser posterior ao startDate');
    }

    const minDurationMinutes = 10;
    const diffMin = (endDate.getTime() - startDate.getTime()) / 60000;
    if (diffMin < minDurationMinutes) {
      throw new BadRequestException(`Duração mínima do evento: ${minDurationMinutes} minutos`);
    }

    // (A.start < B.end) AND (A.end > B.start) = overlap
    const overlap: Prisma.EventWhereInput = {
      venueId,
      AND: [{ startDate: { lt: endDate } }, { endDate: { gt: startDate } }],
    };

    const conflicts = await this.prisma.event.findMany({
      where: excludeEventId ? { ...overlap, NOT: { id: excludeEventId } } : overlap,
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
      },
    });

    if (conflicts.length) {
      const c = conflicts[0];
      const fmt = (d: Date) => d.toLocaleString('pt-BR');
      throw new ConflictException({
        statusCode: 409,
        error: 'ScheduleConflict',
        message: `Conflito de agenda no local selecionado. Evento "${c.name}" está agendado de ${fmt(c.startDate)} até ${fmt(c.endDate)}.`,
        conflict: c,
      });
    }
  }

  private async fallbackAdminId() {
    const admin = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });
    if (!admin) throw new BadRequestException('Nenhum usuário admin encontrado. Rode o seed.');
    return admin.id;
  }

  async findAll(
    params: {
      page?: number;
      perPage?: number;
      search?: string;
      venueId?: string;
      category?: string;
      upcomingOnly?: boolean;
    } = {},
  ) {
    const { page = 1, perPage = 20, search, venueId, category, upcomingOnly = false } = params;
    const skip = Math.max(0, page - 1) * perPage;
    const take = Math.min(100, Math.max(1, perPage));

    const where: Prisma.EventWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { venue: { name: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : undefined,
        venueId ? { venueId } : undefined,
        category ? { category } : undefined,
        upcomingOnly ? { startDate: { gte: new Date() } } : undefined,
      ].filter(Boolean) as Prisma.EventWhereInput[],
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        skip,
        take,
        where,
        include: EVENT_INCLUDES,
        orderBy: [{ startDate: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        perPage: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findRecent(limit = 3) {
    return this.prisma.event.findMany({
      take: Math.max(1, Math.min(50, limit)),
      orderBy: [{ createdAt: 'desc' }],
      include: EVENT_INCLUDES,
    });
  }

  async findUpcoming(limit = 3) {
    return this.prisma.event.findMany({
      take: Math.max(1, Math.min(50, limit)),
      where: { startDate: { gte: new Date() } },
      orderBy: [{ startDate: 'asc' }],
      include: EVENT_INCLUDES,
    });
  }

  async findOne(id: string) {
    const ev = await this.prisma.event.findUnique({
      where: { id },
      include: EVENT_INCLUDES,
    });
    if (!ev) throw new NotFoundException(`Evento #${id} não encontrado`);
    return ev;
  }

  async countTotal() {
    return this.prisma.event.count();
  }

  async create(dto: CreateEventDto, createdByIdFromToken?: string) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // RN-02: Evento obrigatoriamente possui 1 local
    const venue = await this.prisma.venue.findUnique({
      where: { id: dto.venueId },
      select: { id: true, name: true },
    });
    if (!venue) {
      throw new BadRequestException(
        `Local (venueId=${dto.venueId}) não existe. Crie o local antes do evento.`,
      );
    }

    // RN-04: Sem conflito de agenda
    await this.assertNoScheduleConflict({
      venueId: venue.id,
      startDate,
      endDate,
    });

    const createdById = createdByIdFromToken ?? dto.createdById ?? (await this.fallbackAdminId());

    this.logger.log(
      `Criando evento "${dto.name}" em ${venue.name} (${startDate.toISOString()} → ${endDate.toISOString()})`,
    );

    try {
      return this.prisma.event.create({
        data: {
          name: dto.name,
          description: dto.description,
          category: dto.category,
          venueId: venue.id,
          startDate,
          endDate,
          coverImage: dto.coverImage,
          createdById,
        },
        include: EVENT_INCLUDES,
      });
    } catch (err) {
      this.logger.error('Erro ao criar evento', err);
      throw new BadRequestException('Não foi possível criar o evento');
    }
  }

  async update(id: string, dto: UpdateEventDto) {
    const existing = await this.findOne(id);

    const startDate = dto.startDate ? new Date(dto.startDate) : existing.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : existing.endDate;
    const venueId = dto.venueId ?? existing.venueId;

    if (dto.venueId || dto.startDate || dto.endDate) {
      await this.assertNoScheduleConflict({
        venueId,
        startDate,
        endDate,
        excludeEventId: id,
      });
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        startDate,
        endDate,
      },
      include: EVENT_INCLUDES,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.event.delete({ where: { id } });
    return { ok: true as const, id };
  }
}
