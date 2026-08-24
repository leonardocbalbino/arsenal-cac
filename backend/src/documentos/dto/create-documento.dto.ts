import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoDocumento, EntidadeAlvo } from '@prisma/client';

export class CreateDocumentoDto {
  @IsEnum(TipoDocumento)
  tipo: TipoDocumento;

  @IsEnum(EntidadeAlvo)
  entidadeAlvo: EntidadeAlvo;

  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsString()
  armaId?: string;

  @IsOptional()
  @IsString()
  clubeId?: string;

  @IsOptional()
  @IsDateString()
  dataEmissao?: string;

  @IsOptional()
  @IsDateString()
  dataValidade?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
