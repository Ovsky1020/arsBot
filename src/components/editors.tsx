import { useEffect, useState } from 'react'
import { Btn, Chip, Input, Label, Select, Textarea } from './ui'
import { Sheet } from './Sheet'
import { ConfirmBar } from './Sheet'
import { PALETTE, swatch, PRIORITIES } from '../lib/palette'
import { WEEKDAYS } from '../lib/date'
import { useStore } from '../store/StoreProvider'
import type { ClassSlot, Note, Priority, Task, Weekday } from '../lib/types'
import { IconPin, IconTrash } from './icons'

/* ---------------------------------- Clase --------------------------------- */

export function ClassSheet({
  open,
  onClose,
  initial,
  defaultDay = 0,
  defaultStart,
}: {
  open: boolean
  onClose: () => void
  initial?: ClassSlot | null
  defaultDay?: Weekday
  defaultStart?: string
}) {
  const { addClass, updateClass, removeClass } = useStore()
  const buildForm = (): Omit<ClassSlot, 'id'> => {
    const start = initial?.start ?? defaultStart ?? '08:30'
    const end =
      initial?.end ??
      (defaultStart
        ? `${String(Math.min(21, Number(defaultStart.slice(0, 2)) + 1)).padStart(2, '0')}:${defaultStart.slice(3)}`
        : '10:00')
    return {
      title: initial?.title ?? '',
      teacher: initial?.teacher ?? '',
      room: initial?.room ?? '',
      day: initial?.day ?? defaultDay,
      start,
      end,
      color: initial?.color ?? 'blue',
    }
  }
  const [form, setForm] = useState<Omit<ClassSlot, 'id'>>(buildForm)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(buildForm())
      setConfirming(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial, defaultDay, defaultStart])

  const valid = form.title.trim().length > 0 && form.end > form.start

  const save = () => {
    if (!valid) return
    const clean = { ...form, title: form.title.trim() }
    if (initial) updateClass({ ...clean, id: initial.id })
    else addClass(clean)
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? 'Editar clase' : 'Nueva clase'}
      footer={
        confirming ? (
          <ConfirmBar
            label="Eliminar clase"
            onCancel={() => setConfirming(false)}
            onConfirm={() => {
              removeClass(initial!.id)
              onClose()
            }}
          />
        ) : (
          <div className="flex gap-2">
            {initial ? (
              <Btn variant="danger" size="lg" className="w-auto px-4" onClick={() => setConfirming(true)}>
                <IconTrash size={18} />
              </Btn>
            ) : null}
            <Btn variant="primary" size="lg" onClick={save} disabled={!valid}>
              {initial ? 'Guardar cambios' : 'Añadir clase'}
            </Btn>
          </div>
        )
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Asignatura</Label>
          <Input
            autoFocus
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Matemáticas"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Label>Profesor/a</Label>
            <Input
              value={form.teacher ?? ''}
              onChange={(e) => setForm({ ...form, teacher: e.target.value })}
              placeholder="Opcional"
            />
          </div>
          <div className="w-32">
            <Label>Aula</Label>
            <Input
              value={form.room ?? ''}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              placeholder="A-12"
            />
          </div>
        </div>

        <div>
          <Label>Día</Label>
          <Select
            value={form.day}
            onChange={(e) => setForm({ ...form, day: Number(e.target.value) as Weekday })}
          >
            {WEEKDAYS.map((d, i) => (
              <option key={d.short} value={i}>
                {d.long}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Label>Empieza</Label>
            <Input
              type="time"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <Label>Termina</Label>
            <Input
              type="time"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />
          </div>
        </div>
        {form.end <= form.start ? (
          <p className="-mt-2 text-[13px] text-danger">La hora de fin debe ser posterior al inicio.</p>
        ) : null}

        <div>
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2.5">
            {PALETTE.map((p) => (
              <button
                key={p.key}
                aria-label={p.label}
                onClick={() => setForm({ ...form, color: p.key })}
                className={`h-9 w-9 rounded-full transition ${
                  form.color === p.key ? 'ring-2 ring-text ring-offset-2 ring-offset-bg' : ''
                }`}
                style={{ background: p.dot }}
              />
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  )
}

/* ---------------------------------- Tarea --------------------------------- */

export function TaskSheet({
  open,
  onClose,
  initial,
  defaultDue = null,
}: {
  open: boolean
  onClose: () => void
  initial?: Task | null
  defaultDue?: string | null
}) {
  const { addTask, updateTask, removeTask, toggleTask, data } = useStore()
  const [form, setForm] = useState<Omit<Task, 'id' | 'createdAt'>>({
    title: '',
    subject: '',
    due: defaultDue,
    priority: 'media',
    done: false,
  })
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? { title: initial.title, subject: initial.subject ?? '', due: initial.due, priority: initial.priority, done: initial.done }
          : { title: '', subject: '', due: defaultDue, priority: 'media', done: false },
      )
      setConfirming(false)
    }
  }, [open, initial, defaultDue])

  const subjects = Array.from(new Set(data.classes.map((c) => c.title))).sort()
  const valid = form.title.trim().length > 0

  const save = () => {
    if (!valid) return
    const clean = { ...form, title: form.title.trim(), subject: form.subject?.trim() || undefined }
    if (initial) updateTask({ ...clean, id: initial.id, createdAt: initial.createdAt, doneAt: initial.doneAt })
    else addTask(clean)
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? 'Editar tarea' : 'Nueva tarea'}
      footer={
        confirming ? (
          <ConfirmBar
            label="Eliminar tarea"
            onCancel={() => setConfirming(false)}
            onConfirm={() => {
              removeTask(initial!.id)
              onClose()
            }}
          />
        ) : (
          <div className="flex gap-2">
            {initial ? (
              <Btn variant="danger" size="lg" className="w-auto px-4" onClick={() => setConfirming(true)}>
                <IconTrash size={18} />
              </Btn>
            ) : null}
            {initial ? (
              <Btn
                variant="soft"
                size="lg"
                className="w-auto px-4"
                onClick={() => {
                  toggleTask(initial.id)
                  onClose()
                }}
              >
                {initial.done ? 'Reabrir' : 'Hecha'}
              </Btn>
            ) : null}
            <Btn variant="primary" size="lg" onClick={save} disabled={!valid}>
              {initial ? 'Guardar cambios' : 'Añadir tarea'}
            </Btn>
          </div>
        )
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Tarea</Label>
          <Input
            autoFocus
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Entregar ejercicios de derivadas"
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
            }}
          />
        </div>

        <div>
          <Label>Asignatura</Label>
          <Input
            value={form.subject ?? ''}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="Opcional"
            list="asignaturas"
          />
          <datalist id="asignaturas">
            {subjects.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div>
          <Label>Fecha de entrega</Label>
          <Input
            type="date"
            value={form.due ?? ''}
            onChange={(e) => setForm({ ...form, due: e.target.value || null })}
          />
          <div className="mt-2 flex gap-2">
            <Chip active={form.due === null} onClick={() => setForm({ ...form, due: null })}>
              Sin fecha
            </Chip>
            <Chip
              onClick={() => {
                const d = new Date()
                const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                setForm({ ...form, due: iso })
              }}
            >
              Hoy
            </Chip>
            <Chip
              onClick={() => {
                const d = new Date()
                d.setDate(d.getDate() + 1)
                const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                setForm({ ...form, due: iso })
              }}
            >
              Mañana
            </Chip>
          </div>
        </div>

        <div>
          <Label>Prioridad</Label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <Chip
                key={p.key}
                active={form.priority === p.key}
                onClick={() => setForm({ ...form, priority: p.key as Priority })}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.dot }} />
                  {p.label}
                </span>
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  )
}

/* ---------------------------------- Nota ---------------------------------- */

export function NoteSheet({
  open,
  onClose,
  initial,
}: {
  open: boolean
  onClose: () => void
  initial?: Note | null
}) {
  const { addNote, updateNote, removeNote } = useStore()
  const [form, setForm] = useState<{ title: string; body: string; pinned: boolean }>({
    title: '',
    body: '',
    pinned: false,
  })
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (open) {
      setForm({
        title: initial?.title ?? '',
        body: initial?.body ?? '',
        pinned: initial?.pinned ?? false,
      })
      setConfirming(false)
    }
  }, [open, initial])

  const save = () => {
    const title = form.title.trim()
    const body = form.body
    if (!title && !body.trim()) {
      if (initial) removeNote(initial.id)
      onClose()
      return
    }
    if (initial) updateNote({ id: initial.id, title, body, pinned: form.pinned, updatedAt: Date.now() })
    else addNote({ title, body, pinned: form.pinned })
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? 'Editar nota' : 'Nueva nota'}
      footer={
        confirming ? (
          <ConfirmBar
            label="Eliminar nota"
            onCancel={() => setConfirming(false)}
            onConfirm={() => {
              removeNote(initial!.id)
              onClose()
            }}
          />
        ) : (
          <div className="flex gap-2">
            {initial ? (
              <Btn variant="danger" size="lg" className="w-auto px-4" onClick={() => setConfirming(true)}>
                <IconTrash size={18} />
              </Btn>
            ) : null}
            <Btn
              variant="soft"
              size="lg"
              className="w-auto px-4"
              onClick={() => setForm({ ...form, pinned: !form.pinned })}
            >
              <IconPin size={18} className={form.pinned ? 'text-brand' : ''} />
            </Btn>
            <Btn variant="primary" size="lg" onClick={save}>
              Guardar
            </Btn>
          </div>
        )
      }
    >
      <div className="space-y-3">
        <Input
          autoFocus
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Título"
          className="border-none bg-transparent px-0 text-lg font-semibold focus:bg-transparent"
        />
        <Textarea
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
          placeholder="Escribe aquí… Usa - para listas y **negrita** para destacar."
          rows={12}
          className="border-none bg-transparent px-0 leading-relaxed focus:bg-transparent"
        />
      </div>
    </Sheet>
  )
}
