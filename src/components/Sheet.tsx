import { useEffect, type ReactNode } from 'react'
import { Btn } from './ui'
import { IconX } from './icons'

export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  maxHeight = '88vh',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  maxHeight?: string
}) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 animate-fade bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxHeight }}
        className="animate-sheet safe-bottom relative flex w-full max-w-md flex-col rounded-t-3xl border border-line bg-bg shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-[16px] font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-1.5 text-muted transition active:bg-surface-2"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? <div className="border-t border-line px-5 py-3.5">{footer}</div> : null}
      </div>
    </div>
  )
}

export function ConfirmBar({
  onConfirm,
  onCancel,
  label = 'Eliminar',
}: {
  onConfirm: () => void
  onCancel: () => void
  label?: string
}) {
  return (
    <div className="flex gap-2">
      <Btn variant="soft" full onClick={onCancel}>
        Cancelar
      </Btn>
      <Btn variant="primary" full onClick={onConfirm} className="bg-danger">
        {label}
      </Btn>
    </div>
  )
}
