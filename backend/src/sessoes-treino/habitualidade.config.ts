/**
 * Regra de habitualidade (comprovação de treino periódico) exigida pela
 * legislação vigente para renovação do CR: hoje, o mínimo legal é de 8
 * sessões por ano. O usuário pode cadastrar sua própria meta (perfil →
 * metaHabitualidade) caso a exigência aplicável a ele seja diferente —
 * nesse caso a meta cadastrada substitui o mínimo legal padrão abaixo.
 * Ajuste o padrão conforme a portaria/norma do Exército em vigor, pois a
 * regulamentação muda com frequência.
 */
export const META_HABITUALIDADE_PADRAO = 8;

export function metaHabitualidade(usuario: { metaHabitualidade: number | null }): number {
  return usuario.metaHabitualidade ?? META_HABITUALIDADE_PADRAO;
}

/** Início do ano corrente — a habitualidade é contada por ano civil (jan–dez). */
export function inicioAnoAtual(): Date {
  const agora = new Date();
  return new Date(agora.getFullYear(), 0, 1);
}
