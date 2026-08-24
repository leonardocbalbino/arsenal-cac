import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';
import { inicioAnoAtual, metaHabitualidade } from '../sessoes-treino/habitualidade.config';

@Injectable()
export class RelatoriosService {
  constructor(private readonly prisma: PrismaService) {}

  async dossieBuffer(usuarioId: string): Promise<Buffer> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    const [armas, documentos, filiacoes] = await Promise.all([
      this.prisma.arma.findMany({ where: { usuarioId, ativa: true } }),
      this.prisma.documento.findMany({ where: { usuarioId } }),
      this.prisma.filiacao.findMany({ where: { usuarioId, ativa: true }, include: { clube: true } }),
    ]);

    return this.render((doc) => {
      doc.fontSize(18).text('Dossiê CAC', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Nome: ${usuario.nome}`);
      doc.text(`CR: ${usuario.crNumero ?? '-'}`);
      doc.text(`Categoria: ${usuario.categoriaCac ?? '-'}`);
      doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`);
      doc.moveDown();

      doc.fontSize(14).text('Arsenal');
      doc.moveDown(0.5);
      armas.forEach((arma) => {
        doc
          .fontSize(11)
          .text(
            `• ${arma.marca} ${arma.modelo} — calibre ${arma.calibre} — nº série ${arma.numeroSerie} — CRAF ${arma.crafNumero ?? '-'}`,
          );
      });
      doc.moveDown();

      doc.fontSize(14).text('Filiações');
      doc.moveDown(0.5);
      filiacoes.forEach((filiacao) => {
        doc.fontSize(11).text(`• ${filiacao.clube.nome} — sócio ${filiacao.numeroSocio ?? '-'}`);
      });
      doc.moveDown();

      doc.fontSize(14).text('Documentos');
      doc.moveDown(0.5);
      documentos.forEach((documento) => {
        const validade = documento.dataValidade ? documento.dataValidade.toLocaleDateString('pt-BR') : '-';
        doc.fontSize(11).text(`• ${documento.tipo} — nº ${documento.numero ?? '-'} — validade ${validade}`);
      });
    });
  }

  async comprovanteHabitualidadeBuffer(usuarioId: string): Promise<Buffer> {
    const usuario = await this.prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    const categoria = usuario.categoriaCac ?? 'ATIRADOR';
    const minimoSessoes = metaHabitualidade(usuario);
    const inicioPeriodo = inicioAnoAtual();

    const sessoes = await this.prisma.sessaoTreino.findMany({
      where: { usuarioId, data: { gte: inicioPeriodo } },
      include: { clube: true, armas: { include: { arma: true } } },
      orderBy: { data: 'asc' },
    });

    return this.render((doc) => {
      doc.fontSize(18).text('Comprovante de Habitualidade', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Nome: ${usuario.nome}`);
      doc.text(`CR: ${usuario.crNumero ?? '-'}`);
      doc.text(`Categoria: ${categoria}`);
      doc.text(
        `Período analisado: ${inicioPeriodo.toLocaleDateString('pt-BR')} até ${new Date().toLocaleDateString('pt-BR')}`,
      );
      doc.text(`Sessões exigidas no período: ${minimoSessoes}`);
      doc.text(`Sessões registradas: ${sessoes.length}`);
      doc.moveDown();

      doc.fontSize(14).text('Registros de treino');
      doc.moveDown(0.5);
      sessoes.forEach((sessao) => {
        const armasTexto = sessao.armas.map((sa) => `${sa.arma.marca} ${sa.arma.modelo}`).join(', ');
        doc
          .fontSize(11)
          .text(`• ${sessao.data.toLocaleDateString('pt-BR')} — ${sessao.clube?.nome ?? 'Clube não informado'} — armas: ${armasTexto || '-'}`);
      });
    });
  }

  private render(build: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      build(doc);
      doc.end();
    });
  }
}
