-- CreateEnum
CREATE TYPE "CategoriaCac" AS ENUM ('ATIRADOR', 'CACADOR', 'COLECIONADOR');

-- CreateEnum
CREATE TYPE "CategoriaArma" AS ENUM ('PERMITIDA', 'RESTRITA');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CR', 'CRAF', 'GUIA_TRAFEGO', 'ATESTADO_SANIDADE', 'EXAME_PSICOLOGICO', 'COMPROVANTE_RESIDENCIA', 'TITULO_FILIACAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "EntidadeAlvo" AS ENUM ('PERFIL', 'ARMA', 'CLUBE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "crNumero" TEXT,
    "crValidade" TIMESTAMP(3),
    "categoriaCac" "CategoriaCac",
    "fotoUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "armas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "calibre" TEXT NOT NULL,
    "numeroSerie" TEXT NOT NULL,
    "categoria" "CategoriaArma" NOT NULL,
    "crafNumero" TEXT,
    "crafValidade" TIMESTAMP(3),
    "fotoUrl" TEXT,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "armas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manutencoes" (
    "id" TEXT NOT NULL,
    "armaId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT NOT NULL,
    "custo" DECIMAL(10,2),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manutencoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoDocumento" NOT NULL,
    "numero" TEXT,
    "entidadeAlvo" "EntidadeAlvo" NOT NULL,
    "armaId" TEXT,
    "clubeId" TEXT,
    "dataEmissao" TIMESTAMP(3),
    "dataValidade" TIMESTAMP(3),
    "arquivoUrl" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clubes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cbte" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clubes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "filiacoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "clubeId" TEXT NOT NULL,
    "numeroSocio" TEXT,
    "dataFiliacao" TIMESTAMP(3),
    "dataValidade" TIMESTAMP(3),
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "filiacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes_treino" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "clubeId" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "municaoGastaQtd" INTEGER,
    "comprovanteUrl" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessoes_treino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes_treino_armas" (
    "id" TEXT NOT NULL,
    "sessaoTreinoId" TEXT NOT NULL,
    "armaId" TEXT NOT NULL,

    CONSTRAINT "sessoes_treino_armas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municoes" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "armaId" TEXT,
    "calibre" TEXT NOT NULL,
    "tipoMovimento" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "lote" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "notaFiscalUrl" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "municoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "documentoId" TEXT NOT NULL,
    "diasAntecedencia" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoDisparoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "armas_usuarioId_numeroSerie_key" ON "armas"("usuarioId", "numeroSerie");

-- CreateIndex
CREATE UNIQUE INDEX "filiacoes_usuarioId_clubeId_key" ON "filiacoes"("usuarioId", "clubeId");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_treino_armas_sessaoTreinoId_armaId_key" ON "sessoes_treino_armas"("sessaoTreinoId", "armaId");

-- AddForeignKey
ALTER TABLE "armas" ADD CONSTRAINT "armas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manutencoes" ADD CONSTRAINT "manutencoes_armaId_fkey" FOREIGN KEY ("armaId") REFERENCES "armas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_armaId_fkey" FOREIGN KEY ("armaId") REFERENCES "armas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_clubeId_fkey" FOREIGN KEY ("clubeId") REFERENCES "clubes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filiacoes" ADD CONSTRAINT "filiacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "filiacoes" ADD CONSTRAINT "filiacoes_clubeId_fkey" FOREIGN KEY ("clubeId") REFERENCES "clubes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_treino" ADD CONSTRAINT "sessoes_treino_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_treino" ADD CONSTRAINT "sessoes_treino_clubeId_fkey" FOREIGN KEY ("clubeId") REFERENCES "clubes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_treino_armas" ADD CONSTRAINT "sessoes_treino_armas_sessaoTreinoId_fkey" FOREIGN KEY ("sessaoTreinoId") REFERENCES "sessoes_treino"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes_treino_armas" ADD CONSTRAINT "sessoes_treino_armas_armaId_fkey" FOREIGN KEY ("armaId") REFERENCES "armas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municoes" ADD CONSTRAINT "municoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municoes" ADD CONSTRAINT "municoes_armaId_fkey" FOREIGN KEY ("armaId") REFERENCES "armas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas" ADD CONSTRAINT "alertas_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
