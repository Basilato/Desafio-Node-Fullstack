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
    description: 'IDs de TicketTypes liberados para este portão (substitui os anteriores)',
    example: ['seed-inteira', 'seed-vip'],
  })
  @IsOptional()
  @IsArray()
  ticketTypeIds?: string[];
}
