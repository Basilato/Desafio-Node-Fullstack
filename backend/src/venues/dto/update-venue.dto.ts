import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateVenueDto, CreateGateDto } from './create-venue.dto';
import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGateDto extends PartialType(CreateGateDto) {}

export class UpdateVenueDto extends PartialType(OmitType(CreateVenueDto, ['gates'] as const)) {
  @ApiPropertyOptional({ type: [UpdateGateDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateGateDto)
  gates?: UpdateGateDto[];
}
