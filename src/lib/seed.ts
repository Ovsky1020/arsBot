import type { AppData } from './types'
import { addDays, toISODate } from './date'

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function emptyData(): AppData {
  return {
    version: 1,
    classes: [],
    tasks: [],
    notes: [],
    settings: { theme: 'system', name: '', showWeekend: false },
  }
}

/** Datos de ejemplo para que la app no esté vacía la primera vez */
export function seedData(): AppData {
  const today = new Date()
  return {
    version: 1,
    classes: [
      { id: uid(), title: 'Matemáticas', teacher: 'Prof. Ruiz', room: 'A-12', day: 0, start: '08:30', end: '10:00', color: 'blue' },
      { id: uid(), title: 'Lengua', teacher: 'Prof.ª Molina', room: 'A-12', day: 0, start: '10:00', end: '11:30', color: 'rose' },
      { id: uid(), title: 'Historia', room: 'B-03', day: 1, start: '08:30', end: '10:00', color: 'amber' },
      { id: uid(), title: 'Física', teacher: 'Prof. Delgado', room: 'Lab 2', day: 1, start: '11:30', end: '13:00', color: 'green' },
      { id: uid(), title: 'Inglés', room: 'A-07', day: 2, start: '09:00', end: '10:30', color: 'violet' },
      { id: uid(), title: 'Educación Física', room: 'Pabellón', day: 2, start: '12:00', end: '13:00', color: 'orange' },
      { id: uid(), title: 'Biología', room: 'B-01', day: 3, start: '08:30', end: '10:00', color: 'teal' },
      { id: uid(), title: 'Matemáticas', teacher: 'Prof. Ruiz', room: 'A-12', day: 4, start: '10:30', end: '12:00', color: 'blue' },
      { id: uid(), title: 'Lengua', room: 'A-12', day: 4, start: '12:00', end: '13:30', color: 'rose' },
    ],
    tasks: [
      { id: uid(), title: 'Entregar ejercicios de derivadas', subject: 'Matemáticas', due: toISODate(today), priority: 'alta', done: false, createdAt: Date.now() },
      { id: uid(), title: 'Leer capítulo 4 de Historia', subject: 'Historia', due: toISODate(addDays(today, 1)), priority: 'media', done: false, createdAt: Date.now() - 1000 },
      { id: uid(), title: 'Redacción: 300 palabras', subject: 'Lengua', due: toISODate(addDays(today, 4)), priority: 'baja', done: false, createdAt: Date.now() - 2000 },
      { id: uid(), title: 'Vocabulario unit 3', subject: 'Inglés', due: toISODate(addDays(today, -1)), priority: 'alta', done: false, createdAt: Date.now() - 3000 },
      { id: uid(), title: 'Resumen de la mitosis', subject: 'Biología', due: null, priority: 'media', done: true, createdAt: Date.now() - 4000, doneAt: Date.now() },
    ],
    notes: [
      {
        id: uid(),
        title: 'Cosas que llevar mañana',
        body: '- Calculadora científica\n- Cuaderno de ejercicios\n- **No olvidar** el trabajo de Historia',
        updatedAt: Date.now(),
        pinned: true,
      },
      {
        id: uid(),
        title: 'Ideas para el trabajo de Biología',
        body: 'Dividirlo en tres partes:\n1. Introducción a la célula\n2. Mitosis y meiosis\n3. Aplicaciones prácticas',
        updatedAt: Date.now() - 86400000,
        pinned: false,
      },
    ],
    settings: { theme: 'system', name: '', showWeekend: false },
  }
}
