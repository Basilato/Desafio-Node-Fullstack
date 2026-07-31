import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketTypeCategory } from '@prisma/client';

export class CreateTicketTypeDto {
  @ApiProperty({ example: 'Camarote Premium', description: 'Nome do tipo de ingresso' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    enum: TicketTypeCategory,
    example: TicketTypeCategory.VIP,
    description: 'Categoria do tipo',
  })
  @IsEnum(TicketTypeCategory)
  category!: TicketTypeCategory;

  @ApiProperty({ example: 500, description: 'Preço unitário em BRL', minimum: 0, maximum: 999999 })
  @IsInt()
  @Min(0)
  @Max(999999)
  price!: number;

  @ApiPropertyOptional({ example: 'Acesso à área VIP, open food, estacionamento incluso' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
