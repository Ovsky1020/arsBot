import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreProvider'
import { TaskRow } from '../components/rows'
import { Chip, Empty, SectionTitle } from '../components/ui'
import { addDays, toISODate } from '../lib/date'
import { IconTareas } from '../components/icons'
import type { Task } from '../lib/types'

type Filter = 'pendientes' | 'hoy' | 'semana' | 'hechas'

export function Tareas({ onOpenTask }: { onOpenTask: (t: Task | null, due?: string | null) => void }) {
  const { data, toggleTask } = useStore()
  const [filter, setFilter] = useState<Filter>('pendientes')

  const today = toISODate(new Date())
  const weekEnd = toISODate(addDays(new Date(), 7))

  const filtered = useMemo(() => {
    const list = data.tasks.filter((t) => {
      if (filter === 'hechas') return t.done
      if (filter === 'hoy') return !t.done && t.due !== null && t.due <= today
      if (filter === 'semana') return !t.done && t.due !== null && t.due <= weekEnd
      return !t.done
    })

    const byPriority = { alta: 0, media: 1, baja: 2 }
    return [...list].sort((a, b) => {
      if (a.due === null && b.due === null) return byPriority[a.priority] - byPriority[b.priority]
      if (a.due === null) return 1
      if (b.due === null) return -1
      if (a.due === b.due) return byPriority[a.priority] - byPriority[b.priority]
      return a.due < b.due ? -1 : 1
    })
  }, [data.tasks, filter, today, weekEnd])

  const counts = useMemo(
    () => ({
      pendientes: data.tasks.filter((t) => !t.done).length,
      hoy: data.tasks.filter((t) => !t.done && t.due !== null && t.due <= today).length,
      semana: data.tasks.filter((t) => !t.done && t.due !== null && t.due <= weekEnd).length,
      hechas: data.tasks.filter((t) => t.done).length,
    }),
    [data.tasks, today, weekEnd],
  )

  const groups = useMemo(() => {
    const g: { key: string; label: string | null; items: Task[] }[] = []
    const push = (key: string, label: string | null, items: Task[]) => {
      if (items.length) g.push({ key, label, items })
    }
    if (filter === 'hechas') {
      push('done', null, filtered)
      return g
    }
    push(
      'overdue',
      'Vencidas',
      filtered.filter((t) => t.due !== null && t.due < today),
    )
    push(
      'today',
      'Hoy',
      filtered.filter((t) => t.due === today),
    )
    push(
      'tomorrow',
      'Mañana',
      filtered.filter((t) => t.due === toISODate(addDays(new Date(), 1))),
    )
    push(
      'week',
      'Esta semana',
      filtered.filter(
        (t) =>
          t.due !== null &&
          t.due > toISODate(addDays(new Date(), 1)) &&
          t.due <= weekEnd,
      ),
    )
    push(
      'later',
      'Más adelante',
      filtered.filter((t) => t.due !== null && t.due > weekEnd),
    )
    push(
      'nodate',
      'Sin fecha',
      filtered.filter((t) => t.due === null),
    )
    return g
  }, [filtered, filter, today, weekEnd])

  return (
    <div className="px-4 pt-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Tareas</h1>
        <p className="mt-0.5 text-[13px] text-muted">
          {counts.pendientes === 0
            ? 'Todo al día 🎉'
            : `${counts.pendientes} pendiente${counts.pendientes === 1 ? '' : 's'}`}
        </p>
      </header>

      <div className="scroll-thin -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {(
          [
            ['pendientes', 'Todas'],
            ['hoy', 'Hoy'],
            ['semana', '7 días'],
            ['hechas', 'Hechas'],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <Chip key={key} active={filter === key} onClick={() => setFilter(key)}>
            {label} {counts[key] > 0 ? `· ${counts[key]}` : ''}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty
          icon={<IconTareas size={26} />}
          title={
            filter === 'hechas' ? 'Aún no has completado tareas' : 'No hay tareas en este filtro'
          }
          hint="Pulsa el botón + para crear una."
        />
      ) : (
        groups.map((group) => (
          <div key={group.key}>
            {group.label ? <SectionTitle>{group.label}</SectionTitle> : null}
            <div className={group.label ? 'space-y-2' : 'space-y-2'}>
              {group.items.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onToggle={() => toggleTask(t.id)}
                  onOpen={() => onOpenTask(t)}
                  showDate={filter !== 'hoy'}
                />
              ))}
            </div>
          </div>
        ))
      )}

      <div className="h-6" />
    </div>
  )
}
