import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketStatus, UpdateTicketDto } from './dto/update-ticket.dto';
import { ListTicketsByEventDto } from './dto/list-tickets.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  /** BE-BIZ-02: Capacidade total do venue vs ingressos emitidos */
  async getEventCapacity(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { venue: true, _count: { select: { tickets: true } } },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');

    const ticketsByType = await this.prisma.ticket.groupBy({
      by: ['ticketTypeId', 'status'],
      where: { eventId },
      _count: { _all: true },
    });

    const typesMap = new Map<string, Record<string, number>>();
    for (const t of ticketsByType) {
      const item = typesMap.get(t.ticketTypeId) ?? {};
      item[t.status] = (item[t.status] ?? 0) + t._count._all;
      typesMap.set(t.ticketTypeId, item);
    }

    const types = await this.prisma.ticketType.findMany({
      where: { id: { in: Array.from(typesMap.keys()) } },
    });

    const activeTotal = event._count.tickets;
    const soldByType = types.map((t) => ({
      ticketType: t,
      totals: typesMap.get(t.id) ?? {},
    }));

    return {
      eventId: event.id,
      eventName: event.name,
      venueName: event.venue.name,
      venueCapacity: event.venue.capacity,
      emittedCount: activeTotal,
      remaining: Math.max(0, event.venue.capacity - activeTotal),
      soldByType,
    };
  }

  /** BE-APP-05 + BE-BIZ-02 + BE-BIZ-04: Emitir um ingresso respeitando capacidade e validação de gate liberado */
  async create(dto: CreateTicketDto) {
    return this.prisma.$transaction(async (tx) => {
      const [event, ticketType] = await Promise.all([
        tx.event.findUnique({ where: { id: dto.eventId }, include: { venue: true } }),
        tx.ticketType.findUnique({ where: { id: dto.ticketTypeId } }),
      ]);

      if (!event) throw new NotFoundException('Evento não encontrado');
      if (!ticketType) throw new NotFoundException('Tipo de ingresso não encontrado');

      const pricePaid = (dto.pricePaid ?? Number(ticketType.price)) as unknown as number;
      if (pricePaid < 0) throw new BadRequestException('Preço pago inválido');

      if (dto.gateId) {
        const gate = await tx.gate.findUnique({ where: { id: dto.gateId } });
        if (!gate) throw new NotFoundException('Portão não encontrado');
        if (gate.venueId !== event.venueId) {
          throw new BadRequestException('Este portão não pertence ao mesmo local do evento.');
        }
        const allowed = await tx.allowedTicketType.findUnique({
          where: {
            gateId_ticketTypeId: { gateId: dto.gateId, ticketTypeId: dto.ticketTypeId },
          },
        });
        if (!allowed) {
          throw new BadRequestException(
            `Este tipo de ingresso (${ticketType.name}) não está liberado para o portão ${gate.name} (${gate.identifier}).`,
          );
        }
      }

      const emitted = await tx.ticket.count({
        where: {
          eventId: dto.eventId,
          status: { in: [TicketStatus.ACTIVE, TicketStatus.USED] },
        },
      });

      if (emitted >= event.venue.capacity) {
        throw new ConflictException(
          `Capacidade esgotada para este evento (${event.venue.capacity}/${event.venue.capacity}). Não é possível emitir mais ingressos.`,
        );
      }

      return tx.ticket.create({
        data: {
          eventId: dto.eventId,
          ticketTypeId: dto.ticketTypeId,
          gateId: dto.gateId ?? undefined,
          holderName: dto.holderName,
          holderEmail: dto.holderEmail ?? undefined,
          holderDoc: dto.holderDoc ?? undefined,
          seat: dto.seat ?? undefined,
          pricePaid,
          status: TicketStatus.ACTIVE,
          qrCode: randomUUID(),
        },
        include: {
          ticketType: true,
          gate: true,
          event: { include: { venue: true } },
        },
      });
    });
  }

  async findByEvent(eventId: string, filters: ListTicketsByEventDto = {}) {
    const where: any = { eventId };
    if (filters.gateId) where.gateId = filters.gateId;

    const usedNorm = typeof filters.used === 'string'
      ? filters.used === 'true' || filters.used === '1'
        ? true
        : filters.used === 'false' || filters.used === '0'
          ? false
          : undefined
      : filters.used;

    const statusNorm = typeof filters.status === 'string' && filters.status.trim()
      ? (filters.status.trim().toUpperCase() as TicketStatus)
      : filters.status;

    if (statusNorm) where.status = statusNorm;
    if (usedNorm === true) where.status = TicketStatus.USED;
    else if (usedNorm === false) {
      if (!where.status) {
        where.status = { notIn: [TicketStatus.USED] };
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        include: { ticketType: true, gate: true },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      this.prisma.ticket.count({ where }),
    ]);
    return { items, total };
  }

  async findOne(id: string) {
    const found = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        ticketType: true,
        gate: true,
        event: {
          include: {
            venue: true,
            createdBy: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });
    if (!found) throw new NotFoundException('Ingresso não encontrado');
    return found;
  }

  async update(id: string, dto: UpdateTicketDto) {
    await this.findOne(id);
    return this.prisma.ticket.update({
      where: { id },
      data: {
        holderName: dto.holderName,
        holderEmail: dto.holderEmail,
        holderDoc: dto.holderDoc,
        seat: dto.seat,
        pricePaid: dto.pricePaid,
        status: dto.status,
      },
      include: { ticketType: true, event: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.ticket.update({
      where: { id },
      data: { status: TicketStatus.CANCELLED },
    });
  }

  async countTotal() {
    return this.prisma.ticket.count();
  }

  async statusBreakdownByEvent(eventId: string) {
    const rows = await this.prisma.ticket.groupBy({
      by: ['status'],
      where: { eventId },
      _count: { _all: true },
    });
    return rows.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = r._count._all;
      return acc;
    }, {});
  }
}
