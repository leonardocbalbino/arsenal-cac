import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessaoTreinoDto } from './dto/create-sessao-treino.dto';
import { inicioAnoAtual, metaHabitualidade } from './habitualidade.config';

@Injectable()
export class SessoesTreinoService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(usuarioId: string) {
    return this.prisma.sessaoTreino.findMany({
      where: { usuarioId },
      orderBy: { data: 'desc' },
      include: { armas: { include: { arma: true } }, clube: true },
    });
  }

  async findOne(usuarioId: string, id: string) {
    const sessao = await this.prisma.sessaoTreino.findUnique({
      where: { id },
      include: { armas: { include: { arma: true } }, clube: true },
    });
    if (!sessao) throw new NotFoundException('Sessão de treino não encontrada');
    if (sessao.usuarioId !== usuarioId) throw new ForbiddenException();
    return sessao;
  }

  async create(usuarioId: string, dto: CreateSessaoTreinoDto, comprovanteUrl?: string) {
    return this.prisma.sessaoTreino.create({
      data: {
        usuarioId,
        clubeId: dto.clubeId,
        data: new Date(dto.data),
        municaoGastaQtd: dto.municaoGastaQtd,
        observacoes: dto.observacoes,
        comprovanteUrl,
        armas: {
          create: dto.armasIds.map((armaId) => ({ armaId })),
        },
      },
      include: { armas: { include: { arma: true } }, clube: true },
    });
  }

  async remove(usuarioId: string, id: string) {
    await this.findOne(usuarioId, id);
    await this.prisma.sessaoTreino.delete({ where: { id } });
    return { ok: true };
  }

  async statusHabitualidade(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    const categoria = usuario.categoriaCac ?? 'ATIRADOR';
    const minimoSessoes = metaHabitualidade(usuario);
    const inicioPeriodo = inicioAnoAtual();

    const sessoesNoPeriodo = await this.prisma.sessaoTreino.count({
      where: { usuarioId, data: { gte: inicioPeriodo } },
    });

    const emDia = sessoesNoPeriodo >= minimoSessoes;

    const ultimaSessao = await this.prisma.sessaoTreino.findFirst({
      where: { usuarioId },
      orderBy: { data: 'desc' },
    });

    return {
      categoria,
      periodoMeses: 12,
      minimoSessoesExigido: minimoSessoes,
      sessoesNoPeriodo,
      emDia,
      faltam: Math.max(0, minimoSessoes - sessoesNoPeriodo),
      inicioPeriodo,
      ultimaSessaoEm: ultimaSessao?.data ?? null,
    };
  }
}
