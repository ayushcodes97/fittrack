/** Shared styling constants for Recharts — colours come from the live theme tokens */

export const chartTooltipStyle = {
  backgroundColor: 'var(--color-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 12,
  fontSize: 13,
  fontFamily: '"Manrope", sans-serif',
  color: 'var(--color-text)',
  boxShadow: '0 10px 30px -12px rgba(0, 0, 0, 0.28)',
} as const

export const axisTick = {
  fill: 'var(--color-muted)',
  fontSize: 11,
} as const

export const gridStroke = 'var(--color-border)'
