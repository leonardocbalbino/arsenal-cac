import { Module } from '@nestjs/common';
import { MunicaoService } from './municao.service';
import { MunicaoController } from './municao.controller';

@Module({
  providers: [MunicaoService],
  controllers: [MunicaoController],
  exports: [MunicaoService],
})
export class MunicaoModule {}
