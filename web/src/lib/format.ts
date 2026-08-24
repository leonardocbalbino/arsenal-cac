import { Documento, TipoDocumento } from '@/api/types';

export const rotuloTipo: Record<TipoDocumento, string> = {
  CR: 'CR',
  CRAF: 'CRAF',
  GUIA_TRAFEGO: 'Guia de Tráfego',
  ATESTADO_SANIDADE: 'Atestado de Sanidade',
  EXAME_PSICOLOGICO: 'Exame Psicológico',
  COMPROVANTE_RESIDENCIA: 'Comprovante de Residência',
  TITULO_FILIACAO: 'Título de Filiação',
  OUTRO: 'Outro',
};

const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const MESES_MIN = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function diasRestantes(dataIso: string | null): number | null {
  if (!dataIso) return null;
  return Math.ceil((new Date(dataIso).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

/**
 * Datas "sem hora" (validade, emissão, sessão etc.) chegam da API como
 * ISO em UTC-meia-noite (`new Date('AAAA-MM-DD')` no backend sempre gera
 * UTC, por spec do JS). Ler com getters locais em fusos negativos (Brasil,
 * UTC-3) mostra o dia anterior — por isso todo dia/mês/ano exibido aqui usa
 * os getters UTC, que recuperam o dia calendário pretendido independente do
 * fuso de quem está vendo a tela.
 */
export function formatDataMono(dataIso: string): string {
  const d = new Date(dataIso);
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatMesAno(dataIso: string): string {
  const d = new Date(dataIso);
  return `${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

/** "22 AGO" — dia + mês abreviado em caixa alta, sem ano. */
export function formatDiaMes(dataIso: string): string {
  const d = new Date(dataIso);
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MESES[d.getUTCMonth()]}`;
}

/** DD/MM/AAAA — formato brasileiro padrão para datas sem hora. */
export function formatDataBr(dataIso: string): string {
  const d = new Date(dataIso);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

/** Converte um Date local (ex: "hoje") para "AAAA-MM-DD" preservando o dia
 * calendário local, em vez de usar toISOString (que pode voltar um dia em
 * fusos negativos). */
export function dateParaIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatFimPeriodo(inicioPeriodoIso: string, periodoMeses: number): string {
  const inicio = new Date(inicioPeriodoIso);
  if (periodoMeses === 12) {
    return `Ano encerra em 31 dez ${inicio.getUTCFullYear()}`;
  }
  const fim = new Date(inicio);
  fim.setUTCMonth(fim.getUTCMonth() + periodoMeses);
  return `Semestre encerra em ${fim.getUTCDate()} ${MESES_MIN[fim.getUTCMonth()]} ${fim.getUTCFullYear()}`;
}

export function formatContagem(dias: number | null): string {
  if (dias === null) return '-';
  if (dias < 0) return 'Vencido';
  if (dias <= 90) return `${dias} dia${dias === 1 ? '' : 's'}`;
  const meses = Math.max(1, Math.round(dias / 30));
  return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
}

export function tituloVencimento(doc: Documento): string {
  switch (doc.tipo) {
    case 'CR':
      return 'CR · Certificado de Registro';
    case 'CRAF':
      return doc.arma ? `CRAF · ${doc.arma.marca} ${doc.arma.modelo}` : 'CRAF';
    case 'GUIA_TRAFEGO':
      return doc.arma ? `Guia de Tráfego · ${doc.arma.calibre}` : 'Guia de Tráfego';
    case 'TITULO_FILIACAO':
      return doc.clube ? `Filiação · ${doc.clube.nome}` : 'Filiação a clube';
    default:
      return rotuloTipo[doc.tipo];
  }
}

export function metaVencimento(doc: Documento): string {
  const data = doc.dataValidade ? formatDataMono(doc.dataValidade) : 'sem data';
  const extra = doc.arma ? `${doc.arma.marca} ${doc.arma.modelo}` : doc.clube ? doc.clube.nome : doc.numero;
  return extra ? `${data} · ${extra}` : data;
}
