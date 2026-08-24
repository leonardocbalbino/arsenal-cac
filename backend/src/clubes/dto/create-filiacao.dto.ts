import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateFiliacaoDto {
  @IsString()
  clubeId: string;

  @IsOptional()
  @IsString()
  numeroSocio?: string;

  @IsOptional()
  @IsDateString()
  dataFiliacao?: string;

  @IsOptional()
  @IsDateString()
  dataValidade?: string;
}
