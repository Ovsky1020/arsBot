export type Swatch = {
  key: string
  label: string
  dot: string
  soft: string
  softDark: string
  ink: string
  inkDark: string
}

export const PALETTE: Swatch[] = [
  { key: 'blue', label: 'Azul', dot: '#3b82f6', soft: '#dbeafe', softDark: '#1e3a8a', ink: '#1d4ed8', inkDark: '#bfdbfe' },
  { key: 'green', label: 'Verde', dot: '#22c55e', soft: '#dcfce7', softDark: '#14532d', ink: '#15803d', inkDark: '#bbf7d0' },
  { key: 'amber', label: 'Ámbar', dot: '#f59e0b', soft: '#fef3c7', softDark: '#713f12', ink: '#b45309', inkDark: '#fde68a' },
  { key: 'rose', label: 'Rosa', dot: '#f43f5e', soft: '#ffe4e6', softDark: '#881337', ink: '#be123c', inkDark: '#fecdd3' },
  { key: 'violet', label: 'Violeta', dot: '#8b5cf6', soft: '#ede9fe', softDark: '#4c1d95', ink: '#6d28d9', inkDark: '#ddd6fe' },
  { key: 'teal', label: 'Turquesa', dot: '#14b8a6', soft: '#ccfbf1', softDark: '#134e4a', ink: '#0f766e', inkDark: '#99f6e4' },
  { key: 'orange', label: 'Naranja', dot: '#f97316', soft: '#ffedd5', softDark: '#7c2d12', ink: '#c2410c', inkDark: '#fed7aa' },
  { key: 'slate', label: 'Gris', dot: '#64748b', soft: '#e2e8f0', softDark: '#1e293b', ink: '#334155', inkDark: '#cbd5e1' },
]

export function swatch(key: string): Swatch {
  return PALETTE.find((p) => p.key === key) ?? PALETTE[0]
}

export const PRIORITIES: { key: 'alta' | 'media' | 'baja'; label: string; dot: string }[] = [
  { key: 'alta', label: 'Alta', dot: '#ef4444' },
  { key: 'media', label: 'Media', dot: '#f59e0b' },
  { key: 'baja', label: 'Baja', dot: '#64748b' },
]
