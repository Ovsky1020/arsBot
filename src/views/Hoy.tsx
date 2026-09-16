import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreProvider'
import { useNow } from '../lib/useNow'
import { ClassRow, TaskRow } from '../components/rows'
import { Empty, Input, SectionTitle } from '../components/ui'
import {
  formatDuration,
  formatLongDate,
  greeting,
  minutesFromHHMM,
  nowMinutes,
  toISODate,
  weekdayIndex,
} from '../lib/date'
import { Card } from '../components/ui'
import { IconClock, IconHoy, IconTareas } from '../components/icons'
import type { ClassSlot, Task } from '../lib/types'

export function Hoy({
  onOpenTask,
  onGoHorario,
}: {
  onOpenTask: (t: Task | null, due?: string | null) => void
  onGoHorario: () => void
}) {
  const { data, addTask, toggleTask } = useStore()
  const now = useNow()
  const [quick, setQuick] = useState('')

  const todayIdx = weekdayIndex(now)
  const minutes = nowMinutes(now)
  const iso = toISODate(now)

  const todayClasses = useMemo(
    () => data.classes.filter((c) => c.day === todayIdx).sort((a, b) => a.start.localeCompare(b.start)),
    [data.classes, todayIdx],
  )

  const current = todayClasses.find(
    (c) => minutesFromHHMM(c.start) <= minutes && minutes < minutesFromHHMM(c.end),
  )
  const next = todayClasses.find((c) => minutesFromHHMM(c.start) > minutes)

  const tasksToday = data.tasks.filter((t) => !t.done && t.due === iso)
  const overdue = data.tasks.filter((t) => !t.done && t.due !== null && t.due < iso)
  const upcoming = data.tasks
    .filter((t) => !t.done && t.due !== null && t.due > iso)
    .sort((a, b) => a.due!.localeCompare(b.due!))
    .slice(0, 3)

  const name = data.settings.name.trim()

  const submitQuick = () => {
    const title = quick.trim()
    if (!title) return
    addTask({ title, subject: undefined, due: iso, priority: 'media', done: false })
    setQuick('')
  }

  const progress = (() => {
    const relevant = data.tasks.filter((t) => t.due === iso || (t.due !== null && t.due < iso))
    if (relevant.length === 0) return null
    const done = relevant.filter((t) => t.done).length
    return { done, total: relevant.length, pct: Math.round((done / relevant.length) * 100) }
  })()

  const highlight: { slot: ClassSlot; state: 'current' | 'next' } | null = current
    ? { slot: current, state: 'current' }
    : next
      ? { slot: next, state: 'next' }
      : null

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <p className="text-[13px] font-medium text-muted">{formatLongDate(now)}</p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight">
          {greeting(now)}
          {name ? `, ${name}` : ''}
        </h1>
      </header>

      {/* Próxima clase */}
      {highlight ? (
        <Card className="mb-2 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-2">
            <span className="text-[11.5px] font-semibold tracking-wide text-muted uppercase">
              {highlight.state === 'current' ? 'En clase ahora' : 'Siguiente clase'}
            </span>
            <span className="flex items-center gap-1.5 text-[12px] text-muted">
              <IconClock size={13} />
              {highlight.state === 'current'
                ? `Termina en ${formatDuration(minutesFromHHMM(highlight.slot.end) - minutes)}`
                : `Empieza en ${formatDuration(minutesFromHHMM(highlight.slot.start) - minutes)}`}
            </span>
          </div>
          <div className="p-3">
            <ClassRow
              slot={highlight.slot}
              state={highlight.state}
              onClick={() => onGoHorario()}
            />
          </div>
        </Card>
      ) : (
        <Card className="mb-2 flex items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-muted">
            <IconHoy size={20} />
          </div>
          <div>
            <p className="font-semibold">
              {todayClasses.length === 0 ? 'Sin clases hoy' : 'Clases terminadas'}
            </p>
            <p className="text-[13px] text-muted">
              {todayClasses.length === 0
                ? 'Toca el botón + en Horario para añadir tu horario.'
                : 'Aprovecha para adelantar tareas.'}
            </p>
          </div>
        </Card>
      )}

      {/* Añadir tarea rápida */}
      <Card className="mb-2 flex items-center gap-2 px-3.5 py-2.5">
        <IconTareas size={18} className="shrink-0 text-muted" />
        <Input
          value={quick}
          onChange={(e) => setQuick(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitQuick()
          }}
          placeholder="Añadir tarea para hoy…"
          className="border-none bg-transparent px-0 py-1 focus:bg-transparent"
        />
        {quick.trim() ? (
          <button onClick={submitQuick} className="shrink-0 text-[14px] font-semibold text-brand">
            Añadir
          </button>
        ) : null}
      </Card>

      {progress ? (
        <div className="mb-1 mt-4 flex items-center gap-3 px-0.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-ok transition-all duration-500"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
          <span className="text-[12px] text-muted">
            {progress.done}/{progress.total} hechas
          </span>
        </div>
      ) : null}

      {/* Tareas */}
      {overdue.length > 0 ? (
        <>
          <SectionTitle>Vencidas ({overdue.length})</SectionTitle>
          <div className="space-y-2">
            {overdue.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                onToggle={() => toggleTask(t.id)}
                onOpen={() => onOpenTask(t)}
              />
            ))}
          </div>
        </>
      ) : null}

      <SectionTitle
        action={
          <button onClick={() => onOpenTask(null, iso)} className="text-[13px] font-medium text-brand">
            + nueva
          </button>
        }
      >
        Para hoy
      </SectionTitle>
      {tasksToday.length === 0 ? (
        <Empty icon={<IconTareas size={26} />} title="Nada pendiente para hoy" hint="Disfruta el día 😎" />
      ) : (
        <div className="space-y-2">
          {tasksToday.map((t) => (
            <TaskRow key={t.id} task={t} onToggle={() => toggleTask(t.id)} onOpen={() => onOpenTask(t)} />
          ))}
        </div>
      )}

      {upcoming.length > 0 ? (
        <>
          <SectionTitle>Próximas</SectionTitle>
          <div className="space-y-2">
            {upcoming.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={() => toggleTask(t.id)} onOpen={() => onOpenTask(t)} />
            ))}
          </div>
        </>
      ) : null}

      {/* Clases del día */}
      <SectionTitle
        action={
          <button onClick={onGoHorario} className="text-[13px] font-medium text-brand">
            Ver horario
          </button>
        }
      >
        Clases de hoy
      </SectionTitle>
      {todayClasses.length === 0 ? (
        <Empty
          icon={<IconClock size={26} />}
          title="No hay clases este día"
          hint="Añádelas desde la pestaña Horario."
        />
      ) : (
        <div className="space-y-2">
          {todayClasses.map((c) => (
            <ClassRow
              key={c.id}
              slot={c}
              state={
                current?.id === c.id ? 'current' : next?.id === c.id ? 'next' : 'normal'
              }
              onClick={onGoHorario}
            />
          ))}
        </div>
      )}

      <div className="h-6" />
    </div>
  )
}
