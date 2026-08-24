import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UsuariosService } from './usuarios.service';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

@UseGuards(JwtAuthGuard)
@Controller('perfil')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  getPerfil(@CurrentUser() user: { userId: string }) {
    return this.usuariosService.getPerfil(user.userId);
  }

  @Patch()
  updatePerfil(@CurrentUser() user: { userId: string }, @Body() dto: UpdatePerfilDto) {
    return this.usuariosService.updatePerfil(user.userId, dto);
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: { userId: string }) {
    return this.usuariosService.getDashboard(user.userId);
  }
}
