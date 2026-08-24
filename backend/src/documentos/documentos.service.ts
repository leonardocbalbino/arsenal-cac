import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';

const DIAS_ANTECEDENCIA_PADRAO = [90, 30, 15, 7];

@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(usuarioId: string) {
    return this.prisma.documento.findMany({
      where: { usuarioId },
      orderBy: { dataValidade: 'asc' },
      include: { arma: true, clube: true },
    });
  }

  async findOne(usuarioId: string, id: string) {
    const documento = await this.prisma.documento.findUnique({
      where: { id },
      include: { arma: true, clube: true, alertas: true },
    });
    if (!documento) throw new NotFoundException('Documento não encontrado');
    if (documento.usuarioId !== usuarioId) throw new ForbiddenException();
    return documento;
  }

  async create(usuarioId: string, dto: CreateDocumentoDto, arquivoUrl?: string) {
    const documento = await this.prisma.documento.create({
      data: {
        usuarioId,
        tipo: dto.tipo,
        entidadeAlvo: dto.entidadeAlvo,
        numero: dto.numero,
        armaId: dto.armaId,
        clubeId: dto.clubeId,
        dataEmissao: dto.dataEmissao ? new Date(dto.dataEmissao) : undefined,
        dataValidade: dto.dataValidade ? new Date(dto.dataValidade) : undefined,
        observacoes: dto.observacoes,
        arquivoUrl,
      },
    });

    if (documento.dataValidade) {
      await this.prisma.alerta.createMany({
        data: DIAS_ANTECEDENCIA_PADRAO.map((dias) => ({
          usuarioId,
          documentoId: documento.id,
          diasAntecedencia: dias,
        })),
      });
    }

    return documento;
  }

  async update(usuarioId: string, id: string, dto: UpdateDocumentoDto, arquivoUrl?: string) {
    await this.findOne(usuarioId, id);
    return this.prisma.documento.update({
      where: { id },
      data: {
        ...dto,
        dataEmissao: dto.dataEmissao ? new Date(dto.dataEmissao) : undefined,
        dataValidade: dto.dataValidade ? new Date(dto.dataValidade) : undefined,
        arquivoUrl: arquivoUrl ?? undefined,
      },
    });
  }

  async remove(usuarioId: string, id: string) {
    await this.findOne(usuarioId, id);
    await this.prisma.documento.delete({ where: { id } });
    return { ok: true };
  }

  async vencimentos(usuarioId: string, dias = 30) {
    const limite = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
    return this.prisma.documento.findMany({
      where: { usuarioId, dataValidade: { not: null, lte: limite } },
      orderBy: { dataValidade: 'asc' },
      include: { arma: true, clube: true },
    });
  }

  async setAlerta(usuarioId: string, documentoId: string, diasAntecedencia: number, ativo: boolean) {
    await this.findOne(usuarioId, documentoId);
    const existente = await this.prisma.alerta.findFirst({
      where: { documentoId, diasAntecedencia },
    });
    if (existente) {
      return this.prisma.alerta.update({ where: { id: existente.id }, data: { ativo } });
    }
    return this.prisma.alerta.create({
      data: { usuarioId, documentoId, diasAntecedencia, ativo },
    });
  }
}
