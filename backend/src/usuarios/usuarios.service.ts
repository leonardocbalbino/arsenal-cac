import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async getPerfil(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        email: true,
        nome: true,
        crNumero: true,
        crValidade: true,
        categoriaCac: true,
        fotoUrl: true,
        role: true,
        metaHabitualidade: true,
        criadoEm: true,
      },
    });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

  async updatePerfil(usuarioId: string, dto: UpdatePerfilDto) {
    return this.prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        ...dto,
        crValidade: dto.crValidade ? new Date(dto.crValidade) : undefined,
      },
      select: {
        id: true,
        email: true,
        nome: true,
        crNumero: true,
        crValidade: true,
        categoriaCac: true,
        fotoUrl: true,
        role: true,
        metaHabitualidade: true,
      },
    });
  }

  // Resumo usado no dashboard: vencimentos próximos + status de habitualidade
  async getDashboard(usuarioId: string) {
    const hoje = new Date();
    const em30dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

    const documentosProximosVencimento = await this.prisma.documento.findMany({
      where: {
        usuarioId,
        dataValidade: { not: null, lte: em30dias },
      },
      orderBy: { dataValidade: 'asc' },
      take: 10,
    });

    const totalArmas = await this.prisma.arma.count({ where: { usuarioId, ativa: true } });
    const totalDocumentos = await this.prisma.documento.count({ where: { usuarioId } });

    return {
      totalArmas,
      totalDocumentos,
      documentosProximosVencimento,
    };
  }
}
