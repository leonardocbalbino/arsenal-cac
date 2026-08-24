import { Controller, Get, Header, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { RelatoriosService } from './relatorios.service';

@UseGuards(JwtAuthGuard)
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('dossie.pdf')
  @Header('Content-Type', 'application/pdf')
  async dossie(@CurrentUser() user: { userId: string }, @Res() res: Response) {
    const buffer = await this.relatoriosService.dossieBuffer(user.userId);
    res.setHeader('Content-Disposition', 'attachment; filename="dossie-cac.pdf"');
    res.send(buffer);
  }

  @Get('habitualidade.pdf')
  @Header('Content-Type', 'application/pdf')
  async habitualidade(@CurrentUser() user: { userId: string }, @Res() res: Response) {
    const buffer = await this.relatoriosService.comprovanteHabitualidadeBuffer(user.userId);
    res.setHeader('Content-Disposition', 'attachment; filename="comprovante-habitualidade.pdf"');
    res.send(buffer);
  }
}
