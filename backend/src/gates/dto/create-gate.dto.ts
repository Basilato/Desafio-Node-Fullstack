import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGateDto {
  @ApiProperty({ example: 'Portão C', description: 'Nome legível do portão' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    example: 'C',
    description: 'Identificador único no venue (A, B, 1, 2, etc)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  identifier!: string;

  @ApiPropertyOptional({ example: 'Acesso pela Avenida Francisco Matarazzo' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
