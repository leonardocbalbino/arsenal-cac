import { IsDateString, IsIn, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateMunicaoDto {
  @IsString()
  calibre: string;

  @IsIn(['COMPRA', 'USO'])
  tipoMovimento: 'COMPRA' | 'USO';

  @IsInt()
  @IsPositive()
  quantidade: number;

  @IsString()
  armaId: string;

  @IsOptional()
  @IsString()
  lote?: string;

  @IsDateString()
  data: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
