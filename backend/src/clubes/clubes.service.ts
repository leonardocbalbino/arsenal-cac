import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClubeDto } from './dto/create-clube.dto';
import { CreateFiliacaoDto } from './dto/create-filiacao.dto';

@Injectable()
export class ClubesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.clube.findMany({ orderBy: { nome: 'asc' } });
  }

  create(dto: CreateClubeDto) {
    return this.prisma.clube.create({ data: dto });
  }

  async filiacoesDoUsuario(usuarioId: string) {
    return this.prisma.filiacao.findMany({
      where: { usuarioId },
      include: { clube: true },
      orderBy: { dataValidade: 'asc' },
    });
  }

  async filiar(usuarioId: string, dto: CreateFiliacaoDto) {
    return this.prisma.filiacao.upsert({
      where: { usuarioId_clubeId: { usuarioId, clubeId: dto.clubeId } },
      update: {
        numeroSocio: dto.numeroSocio,
        dataFiliacao: dto.dataFiliacao ? new Date(dto.dataFiliacao) : undefined,
        dataValidade: dto.dataValidade ? new Date(dto.dataValidade) : undefined,
        ativa: true,
      },
      create: {
        usuarioId,
        clubeId: dto.clubeId,
        numeroSocio: dto.numeroSocio,
        dataFiliacao: dto.dataFiliacao ? new Date(dto.dataFiliacao) : undefined,
        dataValidade: dto.dataValidade ? new Date(dto.dataValidade) : undefined,
      },
    });
  }

  async removerFiliacao(usuarioId: string, id: string) {
    const filiacao = await this.prisma.filiacao.findUnique({ where: { id } });
    if (!filiacao) throw new NotFoundException('Filiação não encontrada');
    if (filiacao.usuarioId !== usuarioId) throw new ForbiddenException();
    await this.prisma.filiacao.update({ where: { id }, data: { ativa: false } });
    return { ok: true };
  }
}
