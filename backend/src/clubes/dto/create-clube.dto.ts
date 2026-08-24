import { IsOptional, IsString } from 'class-validator';

export class CreateClubeDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  cbte?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  uf?: string;
}
