import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { MunicaoService } from './municao.service';
import { CreateMunicaoDto } from './dto/create-municao.dto';
import { fileFilter, uploadStorage } from '../common/multer.config';

@UseGuards(JwtAuthGuard)
@Controller('municao')
export class MunicaoController {
  constructor(private readonly municaoService: MunicaoService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.municaoService.findAll(user.userId);
  }

  @Get('saldo')
  saldoPorCalibre(@CurrentUser() user: { userId: string }) {
    return this.municaoService.saldoPorCalibre(user.userId);
  }

  @Post()
  @UseInterceptors(FileInterceptor('notaFiscal', { storage: uploadStorage, fileFilter }))
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateMunicaoDto,
    @UploadedFile() notaFiscal?: Express.Multer.File,
  ) {
    const notaFiscalUrl = notaFiscal ? `/uploads/${notaFiscal.filename}` : undefined;
    return this.municaoService.create(user.userId, dto, notaFiscalUrl);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.municaoService.remove(user.userId, id);
  }
}
