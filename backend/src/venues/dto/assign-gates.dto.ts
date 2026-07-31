import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GateAssignmentDto {
  @ApiProperty({ example: 'seed-gate-A1' })
  @IsString()
  gateId!: string;

  @ApiProperty({
    type: [String],
    example: ['seed-inteira', 'seed-vip'],
    description: 'Tipos de ingresso liberados para este portão (substitui os anteriores)',
  })
  @IsArray()
  ticketTypeIds!: string[];
}

export class AssignGatesTicketTypesDto {
  @ApiProperty({ type: [GateAssignmentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GateAssignmentDto)
  assignments!: GateAssignmentDto[];
}
