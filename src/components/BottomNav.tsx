import type { ReactNode } from 'react'
import { IconHoy, IconHorario, IconNotas, IconTareas, IconAjustes } from './icons'

export type Tab = 'hoy' | 'horario' | 'tareas' | 'notas' | 'ajustes'

const ITEMS: { key: Tab; label: string; icon: (p: { size?: number }) => ReactNode }[] = [
  { key: 'hoy', label: 'Hoy', icon: IconHoy },
  { key: 'horario', label: 'Horario', icon: IconHorario },
  { key: 'tareas', label: 'Tareas', icon: IconTareas },
  { key: 'notas', label: 'Notas', icon: IconNotas },
  { key: 'ajustes', label: 'Ajustes', icon: IconAjustes },
]

export function BottomNav({
  tab,
  onChange,
}: {
  tab: Tab
  onChange: (t: Tab) => void
}) {
  return (
    <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-surface/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-stretch">
        {ITEMS.map(({ key, label, icon: Icon }) => {
          const active = tab === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium transition ${
                active ? 'text-brand' : 'text-muted'
              }`}
            >
              <Icon size={22} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
