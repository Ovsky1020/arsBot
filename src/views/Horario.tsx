import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreProvider'
import { ClassRow } from '../components/rows'
import { Btn, Card, Empty } from '../components/ui'
import { WEEKDAYS, minutesFromHHMM, weekdayIndex } from '../lib/date'
import { swatch } from '../lib/palette'
import { IconHorario, IconPlus } from '../components/icons'
import type { ClassSlot, Weekday } from '../lib/types'

const HOUR_H = 52

function roundTo30(min: number) {
  return Math.max(0, Math.round(min / 30) * 30)
}

export function Horario({
  onEditClass,
}: {
  onEditClass: (c: ClassSlot | null, day?: Weekday, start?: string) => void
}) {
  const { data } = useStore()
  const todayIdx = weekdayIndex(new Date())
  const [mode, setMode] = useState<'dia' | 'semana'>('dia')
  const [selected, setSelected] = useState<Weekday>(todayIdx)

  const showWeekend = data.settings.showWeekend
  const days: Weekday[] = useMemo(() => {
    const base: Weekday[] = [0, 1, 2, 3, 4]
    return showWeekend ? [...base, 5, 6] : base
  }, [showWeekend])

  const range = useMemo(() => {
    const starts = data.classes.map((c) => minutesFromHHMM(c.start))
    const ends = data.classes.map((c) => minutesFromHHMM(c.end))
    const min = starts.length ? Math.min(...starts) : 8 * 60
    const max = ends.length ? Math.max(...ends) : 15 * 60
    return {
      start: Math.max(6, Math.floor(min / 60) - 1),
      end: Math.min(22, Math.ceil(max / 60) + 1),
    }
  }, [data.classes])

  const hours = useMemo(
    () => Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i),
    [range],
  )

  const classesOfDay = (day: Weekday) =>
    data.classes.filter((c) => c.day === day).sort((a, b) => a.start.localeCompare(b.start))

  const selectedClasses = classesOfDay(selected)

  const totalMinutes = data.classes.reduce(
    (acc, c) => acc + (minutesFromHHMM(c.end) - minutesFromHHMM(c.start)),
    0,
  )

  return (
    <div className="px-4 pt-6">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Horario</h1>
          <p className="mt-0.5 text-[13px] text-muted">
            {data.classes.length === 0
              ? 'Aún no hay clases'
              : `${data.classes.length} clases · ${Math.round(totalMinutes / 60)} h semanales`}
          </p>
        </div>
        <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
          {(['dia', 'semana'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-2.5 py-1 text-[13px] font-medium capitalize transition ${
                mode === m ? 'bg-surface text-text shadow-sm' : 'text-muted'
              }`}
            >
              {m === 'dia' ? 'Día' : 'Semana'}
            </button>
          ))}
        </div>
      </header>

      <div className="mb-4 flex gap-1.5">
        {days.map((d) => {
          const active = selected === d
          const isToday = d === todayIdx
          return (
            <button
              key={d}
              onClick={() => setSelected(d)}
              className={`relative flex-1 rounded-xl py-2 text-[13px] font-semibold transition ${
                active ? 'bg-text text-bg' : 'bg-surface-2 text-muted'
              }`}
            >
              {WEEKDAYS[d].short}
              {isToday ? (
                <span
                  className={`absolute left-1/2 -bottom-0.5 h-1 w-1 -translate-x-1/2 rounded-full ${
                    active ? 'bg-bg' : 'bg-brand'
                  }`}
                />
              ) : null}
            </button>
          )
        })}
      </div>

      {mode === 'dia' ? (
        <>
          {selectedClasses.length === 0 ? (
            <Empty
              icon={<IconHorario size={26} />}
              title={`Sin clases el ${WEEKDAYS[selected].long.toLowerCase()}`}
              hint="Pulsa el botón de abajo para añadir una."
            />
          ) : (
            <div className="space-y-2">
              {selectedClasses.map((c) => (
                <ClassRow key={c.id} slot={c} onClick={() => onEditClass(c)} />
              ))}
            </div>
          )}

          <Btn variant="primary" size="lg" className="mt-4" onClick={() => onEditClass(null, selected)}>
            <IconPlus size={18} /> Añadir clase el {WEEKDAYS[selected].long.toLowerCase()}
          </Btn>
        </>
      ) : (
        <Card className="scroll-thin overflow-x-auto p-0">
          <div className="min-w-[320px]">
            {/* Cabecera */}
            <div className="flex border-b border-line">
              <div className="w-10 shrink-0" />
              {days.map((d) => (
                <div
                  key={d}
                  className={`flex-1 border-l border-line py-1.5 text-center text-[11.5px] font-semibold ${
                    d === todayIdx ? 'text-brand' : 'text-muted'
                  }`}
                >
                  {WEEKDAYS[d].short}
                </div>
              ))}
            </div>

            {/* Rejilla */}
            <div className="flex">
              <div className="w-10 shrink-0">
                {hours.map((h) => (
                  <div
                    key={h}
                    style={{ height: HOUR_H }}
                    className="relative pr-1 text-right font-mono text-[10.5px] text-muted"
                  >
                    <span className="absolute -top-1.5 right-1">{h}:00</span>
                  </div>
                ))}
              </div>

              {days.map((d) => (
                <div
                  key={d}
                  className={`relative flex-1 border-l border-line ${d === todayIdx ? 'bg-brand-soft/40' : ''}`}
                  style={{ height: hours.length * HOUR_H }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const y = e.clientY - rect.top
                    const min = roundTo30((y / HOUR_H) * 60 + range.start * 60)
                    const hh = String(Math.floor(min / 60)).padStart(2, '0')
                    const mm = String(min % 60).padStart(2, '0')
                    onEditClass(null, d, `${hh}:${mm}`)
                  }}
                >
                  {hours.map((h) => (
                    <div
                      key={h}
                      style={{ height: HOUR_H }}
                      className="border-b border-line/60"
                    />
                  ))}

                  {classesOfDay(d).map((c) => {
                    const s = swatch(c.color)
                    const start = minutesFromHHMM(c.start)
                    const end = minutesFromHHMM(c.end)
                    const top = ((start - range.start * 60) / 60) * HOUR_H
                    const height = Math.max(((end - start) / 60) * HOUR_H - 2, 22)
                    return (
                      <button
                        key={c.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditClass(c)
                        }}
                        style={{
                          top,
                          height,
                          background: `color-mix(in srgb, ${s.dot} 22%, transparent)`,
                          borderColor: s.dot,
                        }}
                        className="absolute inset-x-[2px] overflow-hidden rounded-lg border-l-2 px-1 py-0.5 text-left"
                      >
                        <p
                          className="truncate text-[10.5px] leading-tight font-semibold"
                          style={{ color: s.ink }}
                        >
                          {c.title}
                        </p>
                        {height > 34 ? (
                          <p className="truncate text-[9.5px] leading-tight text-muted">{c.room}</p>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {mode === 'semana' ? (
        <p className="mt-2 px-1 text-[12px] text-muted">
          Toca un hueco vacío para crear una clase a esa hora.
        </p>
      ) : null}

      <div className="h-6" />
    </div>
  )
}
