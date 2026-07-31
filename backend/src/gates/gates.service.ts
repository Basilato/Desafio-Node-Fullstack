import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateGateDto } from './dto/create-gate.dto';
import { UpdateGateDto } from './dto/update-gate.dto';

@Injectable()
export class GatesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertVenueExists(venueId: string) {
    const v = await this.prisma.venue.findUnique({
      where: { id: venueId },
      select: { id: true },
    });
    if (!v) throw new BadRequestException(`Local (venueId=${venueId}) não existe.`);
    return v;
  }

  async create(venueId: string, dto: CreateGateDto) {
    await this.assertVenueExists(venueId);
    try {
      return await this.prisma.gate.create({
        data: {
          venueId,
          name: dto.name,
          identifier: dto.identifier,
          description: dto.description,
        },
        include: { venue: { select: { id: true, name: true, capacity: true } } },
      });
    } catch (e: any) {
      const code = e?.code;
      if (code === 'P2002') {
        throw new ConflictException(
          `Já existe um portão com identificador "${dto.identifier}" neste local.`,
        );
      }
      throw e;
    }
  }

  async listByVenue(venueId: string) {
    await this.assertVenueExists(venueId);
    const [items, total] = await Promise.all([
      this.prisma.gate.findMany({
        where: { venueId },
        orderBy: [{ identifier: 'asc' }, { name: 'asc' }],
        include: {
          _count: { select: { ticketTypes: true } },
          ticketTypes: { include: { ticketType: true } },
        },
      }),
      this.prisma.gate.count({ where: { venueId } }),
    ]);
    return { items, total };
  }

  async findOne(id: string) {
    const g = await this.prisma.gate.findUnique({
      where: { id },
      include: {
        venue: true,
        _count: { select: { ticketTypes: true } },
        ticketTypes: { include: { ticketType: true } },
      },
    });
    if (!g) throw new NotFoundException('Portão não encontrado');
    return g;
  }

  async update(id: string, dto: UpdateGateDto) {
    await this.findOne(id);
    try {
      return await this.prisma.gate.update({
        where: { id },
        data: {
          name: dto.name,
          identifier: dto.identifier,
          description: dto.description,
        },
        include: { venue: { select: { id: true, name: true, capacity: true } } },
      });
    } catch (e: any) {
      const code = e?.code;
      if (code === 'P2002') {
        throw new ConflictException(
          `Já existe um portão com identificador "${dto.identifier}" neste local.`,
        );
      }
      throw e;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.gate.delete({ where: { id } });
  }

  async countByVenue(venueId?: string) {
    const where = venueId ? { venueId } : {};
    return this.prisma.gate.count({ where });
  }
}
