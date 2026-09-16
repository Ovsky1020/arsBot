import { swatch, PRIORITIES } from '../lib/palette'
import { formatRelativeDate, isOverdue, minutesFromHHMM } from '../lib/date'
import type { ClassSlot, Task } from '../lib/types'
import { IconCheck, IconLocation } from './icons'

export function ClassRow({
  slot,
  onClick,
  state = 'normal',
  compact,
}: {
  slot: ClassSlot
  onClick?: () => void
  state?: 'normal' | 'current' | 'next'
  compact?: boolean
}) {
  const s = swatch(slot.color)
  const mins = minutesFromHHMM(slot.end) - minutesFromHHMM(slot.start)
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-stretch gap-3 rounded-2xl border bg-surface p-3 text-left transition active:scale-[0.99] ${
        state === 'current' ? 'border-brand' : 'border-line'
      }`}
      style={state === 'current' ? { boxShadow: `0 0 0 1px ${s.dot}33` } : undefined}
    >
      <div className="w-1.5 shrink-0 rounded-full" style={{ background: s.dot }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-semibold">{slot.title}</p>
          <span className="shrink-0 font-mono text-[12.5px] text-muted">
            {slot.start}–{slot.end}
          </span>
        </div>
        {!compact ? (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
            {slot.room ? (
              <span className="inline-flex items-center gap-1">
                <IconLocation size={13} /> {slot.room}
              </span>
            ) : null}
            {slot.teacher ? <span className="truncate">{slot.teacher}</span> : null}
            <span>{mins} min</span>
          </div>
        ) : null}
      </div>
      {state !== 'normal' ? (
        <span
          className="h-fit shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
          style={{ background: s.soft, color: s.ink }}
        >
          {state === 'current' ? 'Ahora' : 'Siguiente'}
        </span>
      ) : null}
    </button>
  )
}

export function TaskRow({
  task,
  onToggle,
  onOpen,
  showDate = true,
}: {
  task: Task
  onToggle: () => void
  onOpen: () => void
  showDate?: boolean
}) {
  const overdue = isOverdue(task.due, task.done)
  const prio = PRIORITIES.find((p) => p.key === task.priority)!
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3">
      <button
        onClick={onToggle}
        aria-label={task.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
        className={`mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-[7px] border transition active:scale-90 ${
          task.done ? 'border-transparent bg-ok text-white' : 'border-muted/60'
        }`}
      >
        {task.done ? <IconCheck size={14} /> : null}
      </button>

      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <p className={`text-[15px] leading-snug ${task.done ? 'text-muted line-through' : ''}`}>
          {task.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px]">
          {!task.done ? (
            <span className="inline-flex items-center gap-1.5 text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: prio.dot }} />
              {prio.label}
            </span>
          ) : null}
          {task.subject ? (
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-muted">{task.subject}</span>
          ) : null}
          {showDate && task.due ? (
            <span className={overdue ? 'font-medium text-danger' : 'text-muted'}>
              {formatRelativeDate(task.due)}
            </span>
          ) : null}
          {showDate && !task.due && !task.done ? <span className="text-muted">Sin fecha</span> : null}
        </div>
      </button>
    </div>
  )
}
