import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import type { Prisma } from '@prisma/client';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';

const VENUE_INCLUDES = {
  gates: {
    include: {
      ticketTypes: { include: { ticketType: true } },
    },
    orderBy: { identifier: 'asc' } as const,
  },
  events: { orderBy: { startDate: 'desc' }, take: 5 },
} satisfies Prisma.VenueInclude;

@Injectable()
export class VenuesService {
  private readonly logger = new Logger(VenuesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    params: {
      page?: number;
      perPage?: number;
      search?: string;
      includeEvents?: boolean;
    } = {},
  ) {
    const { page = 1, perPage = 20, search, includeEvents = false } = params;
    const skip = Math.max(0, page - 1) * perPage;
    const take = Math.min(100, Math.max(1, perPage));

    const where: Prisma.VenueWhereInput | undefined = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const include: Prisma.VenueInclude = {
      gates: VENUE_INCLUDES.gates,
      ...(includeEvents ? { events: VENUE_INCLUDES.events } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.venue.findMany({
        skip,
        take,
        where,
        include,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.venue.count({ where }),
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

  /** Últimos locais adicionados — rota pública do Dashboard */
  async findRecent(limit = 3) {
    return this.prisma.venue.findMany({
      take: Math.max(1, Math.min(50, limit)),
      orderBy: [{ createdAt: 'desc' }],
      include: { gates: VENUE_INCLUDES.gates, _count: { select: { events: true } } },
    });
  }

  async findOne(id: string) {
    const venue = await this.prisma.venue.findUnique({
      where: { id },
      include: VENUE_INCLUDES,
    });
    if (!venue) {
      throw new NotFoundException(`Local #${id} não encontrado`);
    }
    return venue;
  }

  async countTotal() {
    return this.prisma.venue.count();
  }

  async create(dto: CreateVenueDto, _createdById?: string) {
    this.logger.log(`Criando venue: ${dto.name}`);

    const gatesPayload = dto.gates?.length
      ? {
          create: dto.gates.map((g) => ({
            name: g.name,
            identifier: g.identifier.toUpperCase().trim(),
            description: g.description,
          })),
        }
      : undefined;

    try {
      return this.prisma.venue.create({
        data: {
          name: dto.name,
          capacity: dto.capacity,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          zipCode: dto.zipCode,
          email: dto.email,
          phone: dto.phone,
          description: dto.description,
          gates: gatesPayload,
        },
        include: VENUE_INCLUDES,
      });
    } catch (err) {
      this.logger.error('Erro ao criar venue', err);
      throw new BadRequestException('Não foi possível criar o local');
    }
  }

  async update(id: string, dto: UpdateVenueDto) {
    await this.findOne(id);

    const { gates, ...rest } = dto;

    const gatesOps = async () => {
      if (!gates?.length) return;
      for (const g of gates) {
        if (!g.identifier) continue;
        const identifier = g.identifier.toUpperCase().trim();
        await this.prisma.gate.upsert({
          where: { venueId_identifier: { venueId: id, identifier } },
          create: {
            venueId: id,
            name: g.name ?? identifier,
            identifier,
            description: g.description,
          },
          update: {
            name: g.name ?? undefined,
            description: g.description ?? undefined,
          },
        });
      }
    };

    const [venue] = await this.prisma.$transaction([
      this.prisma.venue.update({
        where: { id },
        data: rest,
        include: VENUE_INCLUDES,
      }),
    ]);
    await gatesOps();

    return venue;
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.venue.delete({ where: { id } });
      return { ok: true as const, id };
    } catch (err) {
      throw new BadRequestException(
        'Não é possível excluir este local pois há eventos vinculados a ele.',
      );
    }
  }

  /**
   * BE-BIZ-04: Substitui os TicketTypes liberados para um portão (catraca) de um venue.
   * Valida que o gate pertence ao venue e os ticketTypes existem.
   */
  async assignGateAllowedTicketTypes(params: {
    venueId: string;
    gateId: string;
    ticketTypeIds: string[];
  }) {
    const { venueId, gateId, ticketTypeIds } = params;

    const gate = await this.prisma.gate.findFirst({
      where: { id: gateId, venueId },
    });
    if (!gate) {
      throw new NotFoundException(`Portão não encontrado neste local`);
    }

    if (ticketTypeIds.length) {
      const exist = await this.prisma.ticketType.count({
        where: { id: { in: ticketTypeIds } },
      });
      if (exist !== ticketTypeIds.length) {
        throw new BadRequestException('Ao menos um tipo de ingresso informado não existe');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.allowedTicketType.deleteMany({ where: { gateId } });
      if (ticketTypeIds.length) {
        await tx.allowedTicketType.createMany({
          data: ticketTypeIds.map((t) => ({ gateId, ticketTypeId: t })),
          skipDuplicates: true,
        });
      }
      return tx.allowedTicketType.findMany({
        where: { gateId },
        include: { ticketType: true },
      });
    });
  }

  /**
   * Atualiza múltiplos gates de um venue em lote com seus tipos de ingresso liberados.
   * Payload [{ gateId, ticketTypeIds: [...]}]
   */
  async assignBulkGateAllowedTicketTypes(params: {
    venueId: string;
    assignments: Array<{ gateId: string; ticketTypeIds: string[] }>;
  }) {
    const { venueId, assignments } = params;
    return Promise.all(
      assignments.map((a) =>
        this.assignGateAllowedTicketTypes({
          venueId,
          gateId: a.gateId,
          ticketTypeIds: a.ticketTypeIds,
        }),
      ),
    );
  }
}
