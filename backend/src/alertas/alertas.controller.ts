import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { AlertasService } from './alertas.service';

@UseGuards(JwtAuthGuard)
@Controller('alertas')
export class AlertasController {
  constructor(private readonly alertasService: AlertasService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.alertasService.findAllDoUsuario(user.userId);
  }

  @Patch(':id')
  toggle(@CurrentUser() user: { userId: string }, @Param('id') id: string, @Body('ativo') ativo: boolean) {
    return this.alertasService.toggle(user.userId, id, ativo);
  }
}
