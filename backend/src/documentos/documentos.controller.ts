import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { fileFilter, uploadStorage } from '../common/multer.config';

@UseGuards(JwtAuthGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.documentosService.findAll(user.userId);
  }

  @Get('vencimentos')
  vencimentos(@CurrentUser() user: { userId: string }, @Query('dias') dias?: string) {
    return this.documentosService.vencimentos(user.userId, dias ? Number(dias) : 30);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.documentosService.findOne(user.userId, id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('arquivo', { storage: uploadStorage, fileFilter }))
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateDocumentoDto,
    @UploadedFile() arquivo?: Express.Multer.File,
  ) {
    const arquivoUrl = arquivo ? `/uploads/${arquivo.filename}` : undefined;
    return this.documentosService.create(user.userId, dto, arquivoUrl);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('arquivo', { storage: uploadStorage, fileFilter }))
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateDocumentoDto,
    @UploadedFile() arquivo?: Express.Multer.File,
  ) {
    const arquivoUrl = arquivo ? `/uploads/${arquivo.filename}` : undefined;
    return this.documentosService.update(user.userId, id, dto, arquivoUrl);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.documentosService.remove(user.userId, id);
  }

  @Patch(':id/alertas/:dias')
  setAlerta(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Param('dias') dias: string,
    @Body('ativo') ativo: boolean,
  ) {
    return this.documentosService.setAlerta(user.userId, id, Number(dias), ativo);
  }
}
