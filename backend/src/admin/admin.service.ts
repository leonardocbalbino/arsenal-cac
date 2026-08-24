import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const hoje = new Date();
    const ha30Dias = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsuarios,
      totalArmas,
      totalDocumentos,
      novosUsuarios30Dias,
      usuariosPorCategoriaRaw,
      armasPorModeloRaw,
      armasPorCalibreRaw,
    ] = await Promise.all([
      this.prisma.usuario.count(),
      this.prisma.arma.count({ where: { ativa: true } }),
      this.prisma.documento.count(),
      this.prisma.usuario.count({ where: { criadoEm: { gte: ha30Dias } } }),
      this.prisma.usuario.groupBy({
        by: ['categoriaCac'],
        _count: { categoriaCac: true },
      }),
      this.prisma.arma.groupBy({
        by: ['marca', 'modelo'],
        where: { ativa: true },
        _count: { marca: true },
        orderBy: { _count: { marca: 'desc' } },
        take: 10,
      }),
      this.prisma.arma.groupBy({
        by: ['calibre'],
        where: { ativa: true },
        _count: { calibre: true },
        orderBy: { _count: { calibre: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalUsuarios,
      totalArmas,
      totalDocumentos,
      novosUsuarios30Dias,
      usuariosPorCategoria: usuariosPorCategoriaRaw.map((item) => ({
        categoria: item.categoriaCac ?? 'NAO_INFORMADA',
        total: item._count.categoriaCac,
      })),
      armasPorModelo: armasPorModeloRaw.map((item) => ({
        marca: item.marca,
        modelo: item.modelo,
        total: item._count.marca,
      })),
      armasPorCalibre: armasPorCalibreRaw.map((item) => ({
        calibre: item.calibre,
        total: item._count.calibre,
      })),
    };
  }
}
