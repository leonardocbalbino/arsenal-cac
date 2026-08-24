import { Module } from '@nestjs/common';
import { ClubesService } from './clubes.service';
import { ClubesController } from './clubes.controller';

@Module({
  providers: [ClubesService],
  controllers: [ClubesController],
  exports: [ClubesService],
})
export class ClubesModule {}
