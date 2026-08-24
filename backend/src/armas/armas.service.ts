import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArmaDto } from './dto/create-arma.dto';
import { UpdateArmaDto } from './dto/update-arma.dto';

@Injectable()
export class ArmasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(usuarioId: string) {
    return this.prisma.arma.findMany({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findOne(usuarioId: string, id: string) {
    const arma = await this.prisma.arma.findUnique({ where: { id } });
    if (!arma) throw new NotFoundException('Arma não encontrada');
    if (arma.usuarioId !== usuarioId) throw new ForbiddenException();
    return arma;
  }

  async create(usuarioId: string, dto: CreateArmaDto, fotoUrlUpload?: string) {
    return this.prisma.arma.create({
      data: {
        ...dto,
        usuarioId,
        fotoUrl: fotoUrlUpload ?? dto.fotoUrl,
        crafValidade: dto.crafValidade ? new Date(dto.crafValidade) : undefined,
      },
    });
  }

  async update(usuarioId: string, id: string, dto: UpdateArmaDto, fotoUrlUpload?: string) {
    await this.findOne(usuarioId, id);
    return this.prisma.arma.update({
      where: { id },
      data: {
        ...dto,
        fotoUrl: fotoUrlUpload ?? dto.fotoUrl,
        crafValidade: dto.crafValidade ? new Date(dto.crafValidade) : undefined,
      },
    });
  }

  async remove(usuarioId: string, id: string) {
    await this.findOne(usuarioId, id);
    await this.prisma.arma.delete({ where: { id } });
    return { ok: true };
  }

  async addManutencao(usuarioId: string, armaId: string, data: { data: string; descricao: string; custo?: number }) {
    await this.findOne(usuarioId, armaId);
    return this.prisma.manutencao.create({
      data: {
        armaId,
        data: new Date(data.data),
        descricao: data.descricao,
        custo: data.custo,
      },
    });
  }

  async listManutencoes(usuarioId: string, armaId: string) {
    await this.findOne(usuarioId, armaId);
    return this.prisma.manutencao.findMany({ where: { armaId }, orderBy: { data: 'desc' } });
  }
}
