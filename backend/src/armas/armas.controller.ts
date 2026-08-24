import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ArmasService } from './armas.service';
import { CreateArmaDto } from './dto/create-arma.dto';
import { UpdateArmaDto } from './dto/update-arma.dto';
import { fileFilter, uploadStorage } from '../common/multer.config';

@UseGuards(JwtAuthGuard)
@Controller('armas')
export class ArmasController {
  constructor(private readonly armasService: ArmasService) {}

  @Get()
  findAll(@CurrentUser() user: { userId: string }) {
    return this.armasService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.armasService.findOne(user.userId, id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('foto', { storage: uploadStorage, fileFilter }))
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateArmaDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    const fotoUrl = foto ? `/uploads/${foto.filename}` : undefined;
    return this.armasService.create(user.userId, dto, fotoUrl);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('foto', { storage: uploadStorage, fileFilter }))
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateArmaDto,
    @UploadedFile() foto?: Express.Multer.File,
  ) {
    const fotoUrl = foto ? `/uploads/${foto.filename}` : undefined;
    return this.armasService.update(user.userId, id, dto, fotoUrl);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.armasService.remove(user.userId, id);
  }

  @Get(':id/manutencoes')
  listManutencoes(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.armasService.listManutencoes(user.userId, id);
  }

  @Post(':id/manutencoes')
  addManutencao(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() body: { data: string; descricao: string; custo?: number },
  ) {
    return this.armasService.addManutencao(user.userId, id, body);
  }
}
