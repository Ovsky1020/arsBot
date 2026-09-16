import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreProvider'
import { Card, Empty, Input } from '../components/ui'
import { renderMarkdown } from '../lib/markdown'
import { IconNotas, IconPin, IconSearch } from '../components/icons'
import type { Note } from '../lib/types'

export function Notas({ onOpenNote }: { onOpenNote: (n: Note | null) => void }) {
  const { data } = useStore()
  const [q, setQ] = useState('')

  const notes = useMemo(() => {
    const query = q.trim().toLowerCase()
    const list = query
      ? data.notes.filter(
          (n) => n.title.toLowerCase().includes(query) || n.body.toLowerCase().includes(query),
        )
      : data.notes
    return [...list].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return b.updatedAt - a.updatedAt
    })
  }, [data.notes, q])

  const lastEdited = (t: number) => {
    const diff = Date.now() - t
    const mins = Math.round(diff / 60000)
    if (mins < 1) return 'ahora mismo'
    if (mins < 60) return `hace ${mins} min`
    const hours = Math.round(mins / 60)
    if (hours < 24) return `hace ${hours} h`
    const days = Math.round(hours / 24)
    if (days === 1) return 'ayer'
    return `hace ${days} días`
  }

  return (
    <div className="px-4 pt-6">
      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Notas</h1>
        <p className="mt-0.5 text-[13px] text-muted">
          {data.notes.length === 0 ? 'Vacío por aquí' : `${data.notes.length} nota${data.notes.length === 1 ? '' : 's'}`}
        </p>
      </header>

      <Card className="mb-4 flex items-center gap-2 px-3.5 py-2.5">
        <IconSearch size={18} className="shrink-0 text-muted" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar en tus notas…"
          className="border-none bg-transparent px-0 py-1 focus:bg-transparent"
        />
      </Card>

      {notes.length === 0 ? (
        <Empty
          icon={<IconNotas size={26} />}
          title={q ? 'Sin resultados' : 'Todavía no hay notas'}
          hint={q ? 'Prueba con otra palabra.' : 'Pulsa + para escribir la primera.'}
        />
      ) : (
        <div className="space-y-2.5">
          {notes.map((n) => (
            <Card key={n.id} className="p-4" onClick={() => onOpenNote(n)}>
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="min-w-0 flex-1 truncate font-semibold">
                  {n.title || 'Sin título'}
                </h3>
                {n.pinned ? <IconPin size={15} className="shrink-0 text-brand" /> : null}
              </div>
              <div className="max-h-24 overflow-hidden">
                {n.body.trim() ? (
                  renderMarkdown(n.body.split('\n').slice(0, 6).join('\n'))
                ) : (
                  <p className="text-[14px] text-muted">Nota vacía</p>
                )}
              </div>
              <p className="mt-2 text-[11.5px] text-muted">{lastEdited(n.updatedAt)}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="h-6" />
    </div>
  )
}
