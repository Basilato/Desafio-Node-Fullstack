import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { TicketStatus } from './update-ticket.dto';

function rawBoolean(obj: any, key: string, fallbackDefault: boolean | undefined = undefined): boolean | undefined {
  const raw = obj?.[key];
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number') {
    if (raw === 1) return true;
    if (raw === 0) return false;
    return fallbackDefault;
  }
  if (typeof raw === 'string') {
    const v = raw.trim().toLowerCase();
    if (v === 'true' || v === '1' || v === 'yes' || v === 'on') return true;
    if (v === 'false' || v === '0' || v === '' || v === 'no' || v === 'off') return false;
  }
  return fallbackDefault;
}

export class ListTicketsByEventDto {
  @ApiPropertyOptional({
    description: 'Filtrar ingressos emitidos para um portão específico (id).',
  })
  @IsOptional()
  @IsString()
  gateId?: string;

  @ApiPropertyOptional({
    description:
      'Filtrar ingressos que foram usados (true → USED, false → NÃO USED).',
  })
  @IsOptional()
  @Transform(({ obj, key }) => rawBoolean(obj, key, undefined), { toClassOnly: true })
  @IsBoolean()
  used?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por status específico do ingresso.',
    enum: TicketStatus,
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;
}
