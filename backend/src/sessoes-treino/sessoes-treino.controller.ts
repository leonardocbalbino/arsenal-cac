import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { SessoesTreinoService } from './sessoes-treino.service';
import { CreateSessaoTreinoDto } from './dto/create-sessao-treino.dto';
import { fileFilter, uploadStorage } from '../common/multer.config';

@UseGuards(JwtAuthGuard)
@Controller('sessoes-treino')
export class SessoesTreinoController {
  constructor(private readonly sessoesTreinoService: SessoesTreinoService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.sessoesTreinoService.findAll(user.userId);
  }

  @Get('habitualidade')
  statusHabitualidade(@CurrentUser() user: { userId: string }) {
    return this.sessoesTreinoService.statusHabitualidade(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.sessoesTreinoService.findOne(user.userId, id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('comprovante', { storage: uploadStorage, fileFilter }))
  create(
    @CurrentUser() user: { userId: string },
    @Body() body: Record<string, string>,
    @UploadedFile() comprovante?: Express.Multer.File,
  ) {
    const dto: CreateSessaoTreinoDto = {
      data: body.data,
      clubeId: body.clubeId || undefined,
      armasIds: Array.isArray(body.armasIds) ? body.armasIds : JSON.parse(body.armasIds ?? '[]'),
      municaoGastaQtd: body.municaoGastaQtd ? Number(body.municaoGastaQtd) : undefined,
      observacoes: body.observacoes,
    };
    const comprovanteUrl = comprovante ? `/uploads/${comprovante.filename}` : undefined;
    return this.sessoesTreinoService.create(user.userId, dto, comprovanteUrl);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.sessoesTreinoService.remove(user.userId, id);
  }
}
