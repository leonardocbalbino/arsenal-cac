import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CategoriaCac } from '@prisma/client';

export class UpdatePerfilDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  crNumero?: string;

  @IsOptional()
  @IsDateString()
  crValidade?: string;

  @IsOptional()
  @IsEnum(CategoriaCac)
  categoriaCac?: CategoriaCac;

  @IsOptional()
  @IsString()
  fotoUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  metaHabitualidade?: number | null;
}
