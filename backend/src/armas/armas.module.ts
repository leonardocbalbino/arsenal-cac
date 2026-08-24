import { Module } from '@nestjs/common';
import { ArmasService } from './armas.service';
import { ArmasController } from './armas.controller';

@Module({
  providers: [ArmasService],
  controllers: [ArmasController],
  exports: [ArmasService],
})
export class ArmasModule {}
