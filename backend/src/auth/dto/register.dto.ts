import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { CategoriaCac } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  senha: string;

  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  crNumero?: string;

  @IsOptional()
  @IsEnum(CategoriaCac)
  categoriaCac?: CategoriaCac;
}
