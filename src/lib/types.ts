export type Priority = 'alta' | 'media' | 'baja'

/** 0 = lunes … 6 = domingo (como en España) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type ClassSlot = {
  id: string
  title: string
  teacher?: string
  room?: string
  day: Weekday
  start: string // "08:30"
  end: string // "10:00"
  color: string // clave de la paleta
}

export type Task = {
  id: string
  title: string
  subject?: string
  /** Fecha de entrega en formato YYYY-MM-DD, o null si no tiene fecha */
  due: string | null
  priority: Priority
  done: boolean
  createdAt: number
  doneAt?: number
}

export type Note = {
  id: string
  title: string
  body: string
  updatedAt: number
  pinned: boolean
}

export type Theme = 'light' | 'dark' | 'system'

export type AppData = {
  version: 1
  classes: ClassSlot[]
  tasks: Task[]
  notes: Note[]
  settings: {
    theme: Theme
    name: string
    showWeekend: boolean
  }
}
