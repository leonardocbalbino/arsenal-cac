import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ArmasModule } from './armas/armas.module';
import { DocumentosModule } from './documentos/documentos.module';
import { ClubesModule } from './clubes/clubes.module';
import { SessoesTreinoModule } from './sessoes-treino/sessoes-treino.module';
import { MunicaoModule } from './municao/municao.module';
import { AlertasModule } from './alertas/alertas.module';
import { RelatoriosModule } from './relatorios/relatorios.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', process.env.UPLOADS_DIR ?? 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    ArmasModule,
    DocumentosModule,
    ClubesModule,
    SessoesTreinoModule,
    MunicaoModule,
    AlertasModule,
    RelatoriosModule,
    AdminModule,
  ],
})
export class AppModule {}
