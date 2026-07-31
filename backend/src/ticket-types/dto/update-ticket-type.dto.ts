import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTicketTypeDto } from './create-ticket-type.dto';
import { IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTicketTypeDto extends PartialType(
  OmitType(CreateTicketTypeDto, [] as const),
) {}

export class AssignAllowedTicketTypesDto {
  @ApiPropertyOptional({
    type: [String],
    description: 'IDs de portões (Gates) liberados para este tipo de ingresso (substitui os anteriores)',
    example: ['seed-gate-A1', 'seed-gate-B2'],
  })
  @IsOptional()
  @IsArray()
  gateIds?: string[];
}
