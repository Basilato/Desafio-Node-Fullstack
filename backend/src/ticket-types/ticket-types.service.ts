import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';

@Injectable()
export class TicketTypesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTicketTypeDto) {
    return this.prisma.ticketType.create({
      data: {
        name: dto.name,
        category: dto.category,
        price: dto.price,
        description: dto.description,
      },
    });
  }

  async findAll() {
    const [items, total] = await Promise.all([
      this.prisma.ticketType.findMany({
        include: {
          _count: { select: { tickets: true, allowedGates: true } },
        },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.ticketType.count(),
    ]);
    return { items, total };
  }

  async findOne(id: string) {
    const found = await this.prisma.ticketType.findUnique({
      where: { id },
      include: {
        allowedGates: { include: { gate: true } },
      },
    });
    if (!found) throw new NotFoundException('Tipo de ingresso não encontrado');
    return found;
  }

  async update(id: string, dto: UpdateTicketTypeDto) {
    await this.findOne(id);
    return this.prisma.ticketType.update({
      where: { id },
      data: {
        name: dto.name,
        category: dto.category,
        price: typeof dto.price === 'number' ? dto.price : undefined,
        description: dto.description,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.ticketType.delete({ where: { id } });
  }

  async countTotal() {
    return this.prisma.ticketType.count();
  }

  /**
   * BE-BIZ-04: Associa um tipo de ingresso a múltiplos portões (liberação de catraca).
   * Substitui todas as associações anteriores para este tipo.
   */
  async assignGates(ticketTypeId: string, gateIds: string[]) {
    await this.findOne(ticketTypeId);
    return this.prisma.$transaction(async (tx) => {
      await tx.allowedTicketType.deleteMany({ where: { ticketTypeId } });
      if (gateIds.length) {
        await tx.allowedTicketType.createMany({
          data: gateIds.map((g) => ({ ticketTypeId, gateId: g })),
          skipDuplicates: true,
        });
      }
      return tx.allowedTicketType.findMany({
        where: { ticketTypeId },
        include: { gate: { include: { venue: true } } },
      });
    });
  }
}
