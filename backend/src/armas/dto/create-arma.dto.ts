import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoriaArma } from '@prisma/client';

export class CreateArmaDto {
  @IsString()
  marca: string;

  @IsString()
  modelo: string;

  @IsString()
  calibre: string;

  @IsString()
  numeroSerie: string;

  @IsEnum(CategoriaArma)
  categoria: CategoriaArma;

  @IsOptional()
  @IsString()
  crafNumero?: string;

  @IsOptional()
  @IsDateString()
  crafValidade?: string;

  @IsOptional()
  @IsString()
  fotoUrl?: string;

  @IsOptional()
  @IsBoolean()
  ativa?: boolean;
}
