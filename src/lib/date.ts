import type { Weekday } from './types'

export const WEEKDAYS: { short: string; long: string }[] = [
  { short: 'L', long: 'Lunes' },
  { short: 'M', long: 'Martes' },
  { short: 'X', long: 'Miércoles' },
  { short: 'J', long: 'Jueves' },
  { short: 'V', long: 'Viernes' },
  { short: 'S', long: 'Sábado' },
  { short: 'D', long: 'Domingo' },
]

/** Lunes = 0 … Domingo = 6 */
export function weekdayIndex(date: Date): Weekday {
  return ((date.getDay() + 6) % 7) as Weekday
}

/** Fecha local en formato YYYY-MM-DD (sin desfase de zona horaria) */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function minutesFromHHMM(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function nowMinutes(date = new Date()): number {
  return date.getHours() * 60 + date.getMinutes()
}

export function formatDuration(min: number): string {
  if (min <= 0) return 'ahora'
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

const longDateFmt = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const shortDateFmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
const timeFmt = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' })

export function formatLongDate(date: Date): string {
  const text = longDateFmt.format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatShortDate(date: Date): string {
  return shortDateFmt.format(date)
}

export function formatTime(date: Date): string {
  return timeFmt.format(date)
}

export function formatRelativeDate(iso: string | null): string {
  if (!iso) return 'Sin fecha'
  const date = fromISODate(iso)
  const today = toISODate(new Date())
  const diff = Math.round(
    (fromISODate(iso).setHours(0, 0, 0, 0) - fromISODate(today).setHours(0, 0, 0, 0)) / 86400000,
  )
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  if (diff === -1) return 'Ayer'
  if (diff < 0) return `Venció hace ${Math.abs(diff)} días`
  if (diff < 7) return formatShortDate(date)
  return formatShortDate(date)
}

export function greeting(date = new Date()): string {
  const h = date.getHours()
  if (h < 6) return 'Buenas noches'
  if (h < 13) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export function isOverdue(iso: string | null, done: boolean): boolean {
  if (!iso || done) return false
  return iso < toISODate(new Date())
}
