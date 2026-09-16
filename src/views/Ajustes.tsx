import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store/StoreProvider'
import { Btn, Card, Input, Label } from '../components/ui'
import { IconDownload, IconMoon, IconMonitor, IconSun, IconUpload } from '../components/icons'
import { emptyData } from '../lib/seed'
import type { AppData, Theme } from '../lib/types'

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice?: Promise<{ outcome: string }> }

export function Ajustes() {
  const { data, setName, setTheme, toggleWeekend, replaceAll, resetAll, resetToEmpty } = useStore()
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as InstallEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const flash = (text: string) => {
    setMsg(text)
    setTimeout(() => setMsg(null), 2500)
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arsbot-copia-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    flash('Copia descargada ✅')
  }

  const importData = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppData
        if (!parsed || !Array.isArray(parsed.classes) || !Array.isArray(parsed.tasks)) {
          throw new Error('Formato no válido')
        }
        replaceAll({
          ...emptyData(),
          ...parsed,
          settings: { ...emptyData().settings, ...(parsed.settings ?? {}) },
        })
        flash('Datos importados ✅')
      } catch {
        flash('No se pudo leer el archivo')
      }
    }
    reader.readAsText(file)
  }

  const confirmReset = (fn: () => void, text: string) => {
    if (window.confirm(text)) fn()
  }

  const themes: { key: Theme; label: string; icon: typeof IconSun }[] = [
    { key: 'light', label: 'Claro', icon: IconSun },
    { key: 'dark', label: 'Oscuro', icon: IconMoon },
    { key: 'system', label: 'Auto', icon: IconMonitor },
  ]

  return (
    <div className="px-4 pt-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
        <p className="mt-0.5 text-[13px] text-muted">Tu agenda se guarda en este dispositivo.</p>
      </header>

      <Card className="mb-4 space-y-4 p-4">
        <div>
          <Label>Tu nombre</Label>
          <Input
            value={data.settings.name}
            onChange={(e) => setName(e.target.value)}
            placeholder="¿Cómo te llamas?"
          />
        </div>

        <div>
          <Label>Tema</Label>
          <div className="flex gap-2">
            {themes.map((t) => {
              const Icon = t.icon
              const active = data.settings.theme === t.key
              return (
                <button
                  key={t.key}
                  onClick={() => setTheme(t.key)}
                  className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3 text-[12.5px] font-medium transition ${
                    active ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-surface-2 text-muted'
                  }`}
                >
                  <Icon size={20} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="pr-3">
            <p className="text-[15px] font-medium">Mostrar fin de semana</p>
            <p className="text-[13px] text-muted">Añade sábado y domingo al horario.</p>
          </div>
          <button
            onClick={toggleWeekend}
            aria-label="Mostrar fin de semana"
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
              data.settings.showWeekend ? 'bg-brand' : 'bg-line'
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                data.settings.showWeekend ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </Card>

      <Card className="mb-4 divide-y divide-line">
        <button
          onClick={exportData}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-surface-2"
        >
          <IconDownload size={19} className="text-brand" />
          <span className="flex-1">Exportar copia de seguridad</span>
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-surface-2"
        >
          <IconUpload size={19} className="text-brand" />
          <span className="flex-1">Importar copia</span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) importData(file)
            e.target.value = ''
          }}
        />

        {installEvent ? (
          <button
            onClick={async () => {
              await installEvent.prompt()
              setInstallEvent(null)
            }}
            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-surface-2"
          >
            <span className="text-[17px]">📱</span>
            <span className="flex-1">Instalar en la pantalla de inicio</span>
          </button>
        ) : null}
      </Card>

      <Card className="mb-4 divide-y divide-line">
        <button
          onClick={() =>
            confirmReset(resetAll, '¿Restaurar los datos de ejemplo? Se perderán tus datos actuales.')
          }
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition active:bg-surface-2"
        >
          <span className="text-[17px]">🌱</span>
          <span className="flex-1">Cargar datos de ejemplo</span>
        </button>
        <button
          onClick={() =>
            confirmReset(resetToEmpty, '¿Borrar todo? Esta acción no se puede deshacer.')
          }
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-danger transition active:bg-surface-2"
        >
          <span className="text-[17px]">🗑️</span>
          <span className="flex-1">Borrar todos mis datos</span>
        </button>
      </Card>

      <Card className="mb-4 p-4">
        <h2 className="mb-1.5 text-[15px] font-semibold">Cómo usarla en el móvil</h2>
        <ol className="list-decimal space-y-1 pl-5 text-[13.5px] leading-relaxed text-muted">
          <li>Abre esta página en el navegador de tu teléfono (Chrome o Safari).</li>
          <li>
            En Chrome: menú ⋮ → <b>Instalar aplicación</b>. En Safari: botón Compartir →{' '}
            <b>Añadir a la pantalla de inicio</b>.
          </li>
          <li>Se abrirá como una app más y funcionará sin conexión.</li>
        </ol>
      </Card>

      <p className="text-center text-[12px] text-muted">
        arsBot · datos guardados solo en tu dispositivo
      </p>

      {msg ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center">
          <div className="animate-pop rounded-full bg-text px-4 py-2 text-[13px] font-medium text-bg shadow-lg">
            {msg}
          </div>
        </div>
      ) : null}

      <div className="h-6" />
    </div>
  )
}
