import { Module } from '@nestjs/common';
import { SessoesTreinoService } from './sessoes-treino.service';
import { SessoesTreinoController } from './sessoes-treino.controller';

@Module({
  providers: [SessoesTreinoService],
  controllers: [SessoesTreinoController],
  exports: [SessoesTreinoService],
})
export class SessoesTreinoModule {}
