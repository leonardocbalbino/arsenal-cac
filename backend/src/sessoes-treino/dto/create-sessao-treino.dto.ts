import { ArrayNotEmpty, IsArray, IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSessaoTreinoDto {
  @IsDateString()
  data: string;

  @IsOptional()
  @IsString()
  clubeId?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  armasIds: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  municaoGastaQtd?: number;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
