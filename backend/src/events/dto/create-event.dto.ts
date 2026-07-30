import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EventCategory } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty({ example: 'Final Copa América' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({
    example: 'Decisão do torneio continental entre Brasil vs Argentina',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: ['FUTEBOL', 'SHOW', 'TEATRO', 'FESTIVAL', 'ESPORTE', 'OUTRO'],
    example: 'FUTEBOL',
  })
  @IsEnum(['FUTEBOL', 'SHOW', 'TEATRO', 'FESTIVAL', 'ESPORTE', 'OUTRO'], {
    message: 'Categoria deve ser uma das opções: FUTEBOL, SHOW, TEATRO, FESTIVAL, ESPORTE, OUTRO',
  })
  category!: EventCategory;

  @ApiProperty({
    example: 'clz0x...',
    description: 'ID do local (Venue) onde o evento acontecerá',
  })
  @IsString()
  @IsNotEmpty()
  venueId!: string;

  @ApiProperty({
    example: '2026-08-10T20:00:00-03:00',
    description: 'Data/hora de início (ISO com fuso)',
  })
  @IsDateString({ strict: true }, { message: 'startDate deve ser ISO-8601 válido' })
  startDate!: string;

  @ApiProperty({
    example: '2026-08-10T22:30:00-03:00',
    description: 'Data/hora de término (ISO com fuso). Deve ser maior que startDate',
  })
  @IsDateString({ strict: true }, { message: 'endDate deve ser ISO-8601 válido' })
  endDate!: string;

  @ApiPropertyOptional({ example: 'https://.../cover.jpg' })
  @IsOptional()
  @IsUrl({}, { message: 'coverImage deve ser uma URL válida' })
  coverImage?: string;

  /**
   * createdById — opcional aqui; quando o usuário não está autenticado,
   * o service usa o primeiro admin do seed.
   */
  @ApiPropertyOptional({ description: 'ID do usuário criador (usa o token JWT se enviado)' })
  @IsOptional()
  @IsString()
  createdById?: string;
}
