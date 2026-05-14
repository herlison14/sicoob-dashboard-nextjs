export function formatCurrency(value: number, compact = false): string {
  if (!isFinite(value) || isNaN(value)) return 'R$ -';

  if (compact) {
    if (Math.abs(value) >= 1_000_000) {
      return `R$ ${(value / 1_000_000).toFixed(2)}M`.replace('.', ',');
    }
    if (Math.abs(value) >= 1_000) {
      return `R$ ${(value / 1_000).toFixed(1)}K`.replace('.', ',');
    }
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercent(value: number): string {
  if (!isFinite(value) || isNaN(value)) return '-';
  return `${(value * 100).toFixed(2)}%`.replace('.', ',');
}

export function formatNumber(value: number): string {
  if (!isFinite(value) || isNaN(value)) return '-';
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Converte qualquer valor para número de forma segura.
 * Útil para dados do Excel que podem vir como string, objeto, etc.
 */
export function toNumber(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return isFinite(value) ? value : 0;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'string') {
    const cleaned = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
    const n = parseFloat(cleaned);
    return isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * Soma uma propriedade numérica de uma lista, com segurança.
 */
export function sumBy<T>(items: T[], key: keyof T): number {
  return items.reduce((sum, item) => sum + toNumber(item[key]), 0);
}

/**
 * Acesso seguro a string.
 */
export function toStr(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}
