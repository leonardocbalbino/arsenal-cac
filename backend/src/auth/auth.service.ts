import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existente = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existente) {
      throw new ConflictException('E-mail já cadastrado');
    }
    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const usuario = await this.prisma.usuario.create({
      data: {
        email: dto.email,
        senhaHash,
        nome: dto.nome,
        crNumero: dto.crNumero,
        categoriaCac: dto.categoriaCac,
      },
    });
    return this.buildToken(usuario.id, usuario.email, usuario.role);
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const senhaOk = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaOk) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.buildToken(usuario.id, usuario.email, usuario.role);
  }

  private buildToken(sub: string, email: string, role: string) {
    const accessToken = this.jwtService.sign({ sub, email, role });
    return { accessToken };
  }
}
