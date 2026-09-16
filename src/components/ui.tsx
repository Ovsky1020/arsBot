import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-line bg-surface ${onClick ? 'active:scale-[0.99] transition' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'soft' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  full?: boolean
}

export function Btn({
  variant = 'soft',
  size = 'md',
  full,
  className = '',
  children,
  ...rest
}: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100'
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-[15px]',
    lg: 'px-5 py-3.5 text-[15px] w-full',
  }
  const variants = {
    primary: 'bg-brand text-white',
    soft: 'bg-surface-2 text-text',
    ghost: 'bg-transparent text-muted',
    danger: 'bg-transparent text-danger',
  }
  return (
    <button
      {...rest}
      className={`${base} ${sizes[size]} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold tracking-wide text-muted uppercase">{children}</label>
}

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={`w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[15px] outline-none transition focus:border-brand focus:bg-surface ${className}`}
    />
  )
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={`w-full resize-none rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[15px] outline-none transition focus:border-brand focus:bg-surface ${className}`}
    />
  )
}

export function Select({
  className = '',
  children,
  ...rest
}: InputHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select
      {...rest}
      className={`w-full appearance-none rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[15px] outline-none transition focus:border-brand ${className}`}
    >
      {children}
    </select>
  )
}

export function Chip({
  active,
  children,
  onClick,
  className = '',
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition active:scale-95 ${
        active ? 'bg-text text-bg' : 'bg-surface-2 text-muted'
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-2.5 mt-6 flex items-center justify-between px-0.5">
      <h2 className="text-[13px] font-semibold tracking-wide text-muted uppercase">{children}</h2>
      {action}
    </div>
  )
}

export function Empty({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode
  title: string
  hint?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-10 text-center">
      {icon ? <div className="mb-2 text-muted">{icon}</div> : null}
      <p className="text-[15px] font-medium">{title}</p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  )
}
