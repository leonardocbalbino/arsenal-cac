import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ClubesService } from './clubes.service';
import { CreateClubeDto } from './dto/create-clube.dto';
import { CreateFiliacaoDto } from './dto/create-filiacao.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class ClubesController {
  constructor(private readonly clubesService: ClubesService) {}

  @Get('clubes')
  findAll() {
    return this.clubesService.findAll();
  }

  @Post('clubes')
  create(@Body() dto: CreateClubeDto) {
    return this.clubesService.create(dto);
  }

  @Get('filiacoes')
  filiacoesDoUsuario(@CurrentUser() user: { userId: string }) {
    return this.clubesService.filiacoesDoUsuario(user.userId);
  }

  @Post('filiacoes')
  filiar(@CurrentUser() user: { userId: string }, @Body() dto: CreateFiliacaoDto) {
    return this.clubesService.filiar(user.userId, dto);
  }

  @Delete('filiacoes/:id')
  removerFiliacao(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.clubesService.removerFiliacao(user.userId, id);
  }
}
