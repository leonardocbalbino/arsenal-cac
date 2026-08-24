import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMunicaoDto } from './dto/create-municao.dto';

@Injectable()
export class MunicaoService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(usuarioId: string) {
    return this.prisma.municao.findMany({
      where: { usuarioId },
      orderBy: { data: 'desc' },
      include: { arma: true },
    });
  }

  create(usuarioId: string, dto: CreateMunicaoDto, notaFiscalUrl?: string) {
    return this.prisma.municao.create({
      data: {
        ...dto,
        usuarioId,
        data: new Date(dto.data),
        notaFiscalUrl,
      },
    });
  }

  async remove(usuarioId: string, id: string) {
    await this.prisma.municao.deleteMany({ where: { id, usuarioId } });
    return { ok: true };
  }

  // Saldo por calibre = total comprado - total usado
  async saldoPorCalibre(usuarioId: string) {
    const registros = await this.prisma.municao.findMany({ where: { usuarioId } });
    const saldos = new Map<string, number>();
    for (const registro of registros) {
      const atual = saldos.get(registro.calibre) ?? 0;
      const delta = registro.tipoMovimento === 'COMPRA' ? registro.quantidade : -registro.quantidade;
      saldos.set(registro.calibre, atual + delta);
    }
    return Array.from(saldos.entries()).map(([calibre, saldo]) => ({ calibre, saldo }));
  }
}
