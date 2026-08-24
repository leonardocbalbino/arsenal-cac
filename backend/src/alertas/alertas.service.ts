import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertasService {
  private readonly logger = new Logger(AlertasService.name);

  constructor(private readonly prisma: PrismaService) {}

  findAllDoUsuario(usuarioId: string) {
    return this.prisma.alerta.findMany({
      where: { usuarioId },
      include: { documento: true },
      orderBy: { criadoEm: 'desc' },
    });
  }

  toggle(usuarioId: string, id: string, ativo: boolean) {
    return this.prisma.alerta.updateMany({
      where: { id, usuarioId },
      data: { ativo },
    });
  }

  /**
   * Roda 1x por dia: verifica quais alertas ativos "disparam" hoje
   * (hoje == dataValidade do documento - diasAntecedencia) e marca o disparo.
   * Ponto de extensão para plugar envio de push (FCM/Expo Push) ou e-mail;
   * hoje o app mobile também agenda notificações locais de forma independente
   * para funcionar offline.
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async verificarAlertasDoDia() {
    const alertasAtivos = await this.prisma.alerta.findMany({
      where: { ativo: true },
      include: { documento: true },
    });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const disparados = alertasAtivos.filter((alerta) => {
      if (!alerta.documento.dataValidade) return false;
      const dataDisparo = new Date(alerta.documento.dataValidade);
      dataDisparo.setDate(dataDisparo.getDate() - alerta.diasAntecedencia);
      dataDisparo.setHours(0, 0, 0, 0);
      return dataDisparo.getTime() === hoje.getTime();
    });

    for (const alerta of disparados) {
      this.logger.log(
        `Alerta de vencimento: documento ${alerta.documentoId} (${alerta.documento.tipo}) vence em ${alerta.diasAntecedencia} dias`,
      );
      await this.prisma.alerta.update({
        where: { id: alerta.id },
        data: { ultimoDisparoEm: new Date() },
      });
    }

    return disparados.length;
  }
}
