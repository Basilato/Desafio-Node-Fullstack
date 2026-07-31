import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ example: 'seed-evento-1', description: 'Evento associado' })
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty({ example: 'seed-inteira', description: 'Tipo do ingresso' })
  @IsString()
  @IsNotEmpty()
  ticketTypeId!: string;

  @ApiProperty({ example: 'Mariana da Silva Santos', description: 'Titular do ingresso' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  holderName!: string;

  @ApiPropertyOptional({ example: 'mariana@email.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  holderEmail?: string;

  @ApiPropertyOptional({ example: '333.222.111-00' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  holderDoc?: string;

  @ApiPropertyOptional({ example: 'A23', description: 'Assento ou setor' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  seat?: string;

  @ApiPropertyOptional({
    example: 120,
    description:
      'Preço pago em BRL. Quando omitido, usa o price do ticketTypeId.',
    minimum: 0,
    maximum: 999999,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(999999)
  pricePaid?: number;

  @ApiPropertyOptional({
    example: 'seed-gate-A1',
    description:
      'Portão de entrada (catraca) associado a este ingresso. Quando fornecido, será validado: (a) o portão deve pertencer ao mesmo local do evento e (b) o tipo de ingresso deve estar liberado para este portão.',
  })
  @IsOptional()
  @IsString()
  gateId?: string;
}
