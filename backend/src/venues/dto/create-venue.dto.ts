import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsArray,
  ValidateNested,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGateDto {
  @ApiProperty({ example: 'Portão C', description: 'Nome legível do portão' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'C', description: 'Identificador único no venue (A, B, 1, 2, etc)' })
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

export class CreateVenueDto {
  @ApiProperty({ example: 'Allianz Parque', description: 'Nome do local' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 43713, description: 'Capacidade total do local' })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiProperty({ example: 'Avenida Francisco Matarazzo, 1705, Água Branca' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address!: string;

  @ApiPropertyOptional({ example: 'São Paulo' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsOptional()
  @IsString()
  @MaxLength(4)
  state?: string;

  @ApiPropertyOptional({ example: '05001-200' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @ApiPropertyOptional({ example: 'contato@allianzparque.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @ApiPropertyOptional({ example: '+55 (11) 3000-0000' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({ example: 'Arena multiuso com infraestrutura premium' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: [CreateGateDto],
    description: 'Portões que pertencem a este local',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGateDto)
  gates?: CreateGateDto[];
}
