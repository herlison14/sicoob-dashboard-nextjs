export function formatCurrency(value: number, compact = false): string {
  if (isNaN(value)) return 'R$ -';

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
  if (isNaN(value)) return '-';
  return `${(value * 100).toFixed(2)}%`.replace('.', ',');
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}
