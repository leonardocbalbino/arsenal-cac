export type CategoriaCac = 'ATIRADOR' | 'CACADOR' | 'COLECIONADOR';
export type CategoriaArma = 'PERMITIDA' | 'RESTRITA';
export type TipoDocumento =
  | 'CR'
  | 'CRAF'
  | 'GUIA_TRAFEGO'
  | 'ATESTADO_SANIDADE'
  | 'EXAME_PSICOLOGICO'
  | 'COMPROVANTE_RESIDENCIA'
  | 'TITULO_FILIACAO'
  | 'OUTRO';
export type EntidadeAlvo = 'PERFIL' | 'ARMA' | 'CLUBE';

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  crNumero: string | null;
  crValidade: string | null;
  categoriaCac: CategoriaCac | null;
  fotoUrl: string | null;
  metaHabitualidade: number | null;
}

export interface Arma {
  id: string;
  usuarioId: string;
  marca: string;
  modelo: string;
  calibre: string;
  numeroSerie: string;
  categoria: CategoriaArma;
  crafNumero: string | null;
  crafValidade: string | null;
  fotoUrl: string | null;
  ativa: boolean;
  criadoEm: string;
}

export interface Clube {
  id: string;
  nome: string;
  cbte: string | null;
  cidade: string | null;
  uf: string | null;
}

export interface Filiacao {
  id: string;
  usuarioId: string;
  clubeId: string;
  clube: Clube;
  numeroSocio: string | null;
  dataFiliacao: string | null;
  dataValidade: string | null;
  ativa: boolean;
}

export interface Documento {
  id: string;
  usuarioId: string;
  tipo: TipoDocumento;
  numero: string | null;
  entidadeAlvo: EntidadeAlvo;
  armaId: string | null;
  arma?: Arma | null;
  clubeId: string | null;
  clube?: Clube | null;
  dataEmissao: string | null;
  dataValidade: string | null;
  arquivoUrl: string | null;
  observacoes: string | null;
}

export interface SessaoTreino {
  id: string;
  usuarioId: string;
  clubeId: string | null;
  clube?: Clube | null;
  data: string;
  municaoGastaQtd: number | null;
  comprovanteUrl: string | null;
  observacoes: string | null;
  armas: { arma: Arma }[];
}

export interface StatusHabitualidade {
  categoria: CategoriaCac;
  periodoMeses: number;
  minimoSessoesExigido: number;
  sessoesNoPeriodo: number;
  emDia: boolean;
  faltam: number;
  inicioPeriodo: string;
  ultimaSessaoEm: string | null;
}

export interface Municao {
  id: string;
  usuarioId: string;
  armaId: string | null;
  arma?: Arma | null;
  calibre: string;
  tipoMovimento: 'COMPRA' | 'USO';
  quantidade: number;
  lote: string | null;
  data: string;
  notaFiscalUrl: string | null;
  observacoes: string | null;
}

export interface Alerta {
  id: string;
  documentoId: string;
  documento: Documento;
  diasAntecedencia: number;
  ativo: boolean;
}

export interface Dashboard {
  totalArmas: number;
  totalDocumentos: number;
  documentosProximosVencimento: Documento[];
}
