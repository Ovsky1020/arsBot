import { useState } from 'react'
import { BottomNav, type Tab } from './components/BottomNav'
import { ClassSheet, NoteSheet, TaskSheet } from './components/editors'
import { Hoy } from './views/Hoy'
import { Horario } from './views/Horario'
import { Tareas } from './views/Tareas'
import { Notas } from './views/Notas'
import { Ajustes } from './views/Ajustes'
import { IconPlus } from './components/icons'
import { weekdayIndex } from './lib/date'
import type { ClassSlot, Note, Task, Weekday } from './lib/types'

export default function App() {
  const [tab, setTab] = useState<Tab>('hoy')

  const [classEditor, setClassEditor] = useState<{
    open: boolean
    initial: ClassSlot | null
    day: Weekday
    start?: string
  }>({ open: false, initial: null, day: 0 })

  const [taskEditor, setTaskEditor] = useState<{
    open: boolean
    initial: Task | null
    due: string | null
  }>({ open: false, initial: null, due: null })

  const [noteEditor, setNoteEditor] = useState<{ open: boolean; initial: Note | null }>({
    open: false,
    initial: null,
  })

  const openClass = (c: ClassSlot | null, day?: Weekday, start?: string) =>
    setClassEditor({ open: true, initial: c, day: day ?? c?.day ?? weekdayIndex(new Date()), start })

  const openTask = (t: Task | null, due?: string | null) =>
    setTaskEditor({ open: true, initial: t, due: due ?? t?.due ?? null })

  const openNote = (n: Note | null) => setNoteEditor({ open: true, initial: n })

  const fabAction = () => {
    if (tab === 'hoy' || tab === 'tareas') openTask(null, tab === 'hoy' ? new Date().toISOString().slice(0, 10) : null)
    else if (tab === 'horario') openClass(null)
    else if (tab === 'notas') openNote(null)
  }

  return (
    <div className="min-h-screen bg-bg">
      <main className="mx-auto min-h-screen w-full max-w-md pb-24 shadow-sm sm:border-x sm:border-line">
        {tab === 'hoy' ? (
          <Hoy onOpenTask={openTask} onGoHorario={() => setTab('horario')} />
        ) : null}
        {tab === 'horario' ? <Horario onEditClass={openClass} /> : null}
        {tab === 'tareas' ? <Tareas onOpenTask={openTask} /> : null}
        {tab === 'notas' ? <Notas onOpenNote={openNote} /> : null}
        {tab === 'ajustes' ? <Ajustes /> : null}
      </main>

      {tab !== 'ajustes' ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-[74px] z-30 flex justify-center">
          <div className="pointer-events-auto flex w-full max-w-md justify-end px-5">
            <button
              onClick={fabAction}
              aria-label="Crear"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/25 transition active:scale-95"
            >
              <IconPlus size={26} />
            </button>
          </div>
        </div>
      ) : null}

      <BottomNav tab={tab} onChange={setTab} />

      <ClassSheet
        open={classEditor.open}
        onClose={() => setClassEditor((s) => ({ ...s, open: false }))}
        initial={classEditor.initial}
        defaultDay={classEditor.day}
        defaultStart={classEditor.start}
      />
      <TaskSheet
        open={taskEditor.open}
        onClose={() => setTaskEditor((s) => ({ ...s, open: false }))}
        initial={taskEditor.initial}
        defaultDue={taskEditor.due}
      />
      <NoteSheet
        open={noteEditor.open}
        onClose={() => setNoteEditor((s) => ({ ...s, open: false }))}
        initial={noteEditor.initial}
      />
    </div>
  )
}
