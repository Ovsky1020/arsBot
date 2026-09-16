import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppData, ClassSlot, Note, Task, Theme } from '../lib/types'
import { emptyData, seedData, uid } from '../lib/seed'

const STORAGE_KEY = 'arsbot.data.v1'

type Store = {
  data: AppData
  ready: boolean
  addClass: (c: Omit<ClassSlot, 'id'>) => void
  updateClass: (c: ClassSlot) => void
  removeClass: (id: string) => void
  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (t: Task) => void
  toggleTask: (id: string) => void
  removeTask: (id: string) => void
  addNote: (n: Omit<Note, 'id' | 'updatedAt'>) => Note
  updateNote: (n: Note) => void
  removeNote: (id: string) => void
  setTheme: (t: Theme) => void
  setName: (name: string) => void
  toggleWeekend: () => void
  replaceAll: (data: AppData) => void
  resetAll: () => void
  resetToEmpty: () => void
}

const StoreContext = createContext<Store | null>(null)

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedData()
    const parsed = JSON.parse(raw) as AppData
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return seedData()
    return {
      ...emptyData(),
      ...parsed,
      settings: { ...emptyData().settings, ...(parsed.settings ?? {}) },
    }
  } catch {
    return seedData()
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setData(load())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      /* cuota llena o modo privado: la app sigue funcionando en memoria */
    }
  }, [data, ready])

  // Tema (claro / oscuro / sistema)
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const dark = data.settings.theme === 'dark' || (data.settings.theme === 'system' && systemDark)
    document.documentElement.classList.toggle('dark', dark)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', dark ? '#191919' : '#f7f6f3')
  }, [data.settings.theme, systemDark])

  const addClass = useCallback((c: Omit<ClassSlot, 'id'>) => {
    setData((d) => ({ ...d, classes: [...d.classes, { ...c, id: uid() }] }))
  }, [])

  const updateClass = useCallback((c: ClassSlot) => {
    setData((d) => ({ ...d, classes: d.classes.map((x) => (x.id === c.id ? c : x)) }))
  }, [])

  const removeClass = useCallback((id: string) => {
    setData((d) => ({ ...d, classes: d.classes.filter((x) => x.id !== id) }))
  }, [])

  const addTask = useCallback((t: Omit<Task, 'id' | 'createdAt'>) => {
    setData((d) => ({ ...d, tasks: [{ ...t, id: uid(), createdAt: Date.now() }, ...d.tasks] }))
  }, [])

  const updateTask = useCallback((t: Task) => {
    setData((d) => ({ ...d, tasks: d.tasks.map((x) => (x.id === t.id ? t : x)) }))
  }, [])

  const toggleTask = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((x) =>
        x.id === id ? { ...x, done: !x.done, doneAt: x.done ? undefined : Date.now() } : x,
      ),
    }))
  }, [])

  const removeTask = useCallback((id: string) => {
    setData((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== id) }))
  }, [])

  const addNote = useCallback((n: Omit<Note, 'id' | 'updatedAt'>) => {
    const note: Note = { ...n, id: uid(), updatedAt: Date.now() }
    setData((d) => ({ ...d, notes: [note, ...d.notes] }))
    return note
  }, [])

  const updateNote = useCallback((n: Note) => {
    setData((d) => ({
      ...d,
      notes: d.notes.map((x) => (x.id === n.id ? { ...n, updatedAt: Date.now() } : x)),
    }))
  }, [])

  const removeNote = useCallback((id: string) => {
    setData((d) => ({ ...d, notes: d.notes.filter((x) => x.id !== id) }))
  }, [])

  const setTheme = useCallback((theme: Theme) => {
    setData((d) => ({ ...d, settings: { ...d.settings, theme } }))
  }, [])

  const setName = useCallback((name: string) => {
    setData((d) => ({ ...d, settings: { ...d.settings, name } }))
  }, [])

  const toggleWeekend = useCallback(() => {
    setData((d) => ({
      ...d,
      settings: { ...d.settings, showWeekend: !d.settings.showWeekend },
    }))
  }, [])

  const replaceAll = useCallback((next: AppData) => setData(next), [])
  const resetAll = useCallback(() => setData(seedData()), [])
  const resetToEmpty = useCallback(() => setData(emptyData()), [])

  const value = useMemo<Store>(
    () => ({
      data,
      ready,
      addClass,
      updateClass,
      removeClass,
      addTask,
      updateTask,
      toggleTask,
      removeTask,
      addNote,
      updateNote,
      removeNote,
      setTheme,
      setName,
      toggleWeekend,
      replaceAll,
      resetAll,
      resetToEmpty,
    }),
    [
      data,
      ready,
      addClass,
      updateClass,
      removeClass,
      addTask,
      updateTask,
      toggleTask,
      removeTask,
      addNote,
      updateNote,
      removeNote,
      setTheme,
      setName,
      toggleWeekend,
      replaceAll,
      resetAll,
      resetToEmpty,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}
