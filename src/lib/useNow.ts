import { useEffect, useState } from 'react'

/** Reloj que se refresca cada 30 s (suficiente para "siguiente clase") */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
