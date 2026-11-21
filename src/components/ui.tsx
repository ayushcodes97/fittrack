import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { tap, tapSoft } from '../utils/haptics'

/* ------------------------------ Card ------------------------------ */

export function Card({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`glass rounded-[22px] border border-border p-5 transition-all duration-200 ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}

/* ----------------------------- Button ----------------------------- */

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const btnVariants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:brightness-105 active:brightness-95 font-semibold',
  outline: 'border border-border bg-tile text-text hover:bg-tile-hover active:bg-tile-hover font-medium',
  ghost: 'bg-transparent text-muted hover:text-text hover:bg-tile font-medium',
  danger: 'bg-transparent text-danger hover:bg-danger/10 font-medium',
}

const btnSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-[14px] gap-2',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, onClick, ...rest }: ButtonProps) {
  return (
    <button
      onClick={(e) => {
        if (variant !== 'ghost' && variant !== 'danger') void tap()
        onClick?.(e)
      }}
      className={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap transition-all duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 ${btnVariants[variant]} ${btnSizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ------------------------------ Modal ------------------------------ */

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  wide?: boolean
  children: ReactNode
}

export function Modal({ open, onClose, title, subtitle, wide, children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  // Render into <body> so page-level transforms (e.g. the animate-rise
  // wrapper) can never break the modal's fixed positioning.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="modal-scrim animate-fade-in absolute inset-0"
        style={{ backgroundImage: 'linear-gradient(rgba(22, 23, 27, 0.06), rgba(22, 23, 27, 0.06))' }}
        onClick={onClose}
      />
      <div
        className={`glass-strong animate-modal-in relative m-0 w-full ${wide ? 'sm:max-w-xl' : 'sm:max-w-md'} max-h-[88vh] overflow-y-auto rounded-t-[24px] border border-border p-6 shadow-2xl sm:m-4 sm:rounded-[24px]`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-sans text-xl font-extrabold leading-snug text-text">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="press flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-tile hover:text-text"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

/* --------------------------- Progress bar --------------------------- */

export function ProgressBar({
  value,
  max,
  color = 'var(--color-accent)',
  height = 'h-1.5',
}: {
  value: number
  max: number
  color?: string
  height?: string
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className={`w-full overflow-hidden rounded-full bg-border ${height}`}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

/* --------------------------- Progress ring --------------------------- */

export function ProgressRing({
  value,
  max,
  size = 220,
  stroke = 16,
  color = 'var(--color-accent)',
  trackColor = 'var(--color-border)',
  children,
}: {
  value: number
  max: number
  size?: number
  stroke?: number
  color?: string
  trackColor?: string
  children?: ReactNode
}) {
  const pct = max > 0 ? Math.min(1, value / max) : 0
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}

/* ----------------------------- Stat card ----------------------------- */

export function StatCard({
  icon,
  label,
  value,
  sub,
  className = '',
}: {
  icon: ReactNode
  label: string
  value: string
  sub?: string
  className?: string
}) {
  return (
    <Card className={`flex items-center gap-4 ${className}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-dim text-accent">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className="truncate text-lg font-bold text-text">{value}</p>
        {sub && <p className="truncate text-xs text-muted">{sub}</p>}
      </div>
    </Card>
  )
}

/* ---------------------------- Empty state ---------------------------- */

export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: ReactNode
  title: string
  desc: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-dim text-accent">{icon}</div>
      <p className="mt-1 font-semibold text-text">{title}</p>
      <p className="max-w-xs text-sm text-muted">{desc}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/* ------------------------------ Skeleton ------------------------------ */

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-border ${className}`} />
}

/* ------------------------------ Stepper ------------------------------ */

export function Stepper({
  value,
  onChange,
  step = 0.5,
  min = 0.25,
  suffix,
}: {
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  suffix?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(min, Math.round((value - step) * 100) / 100))}
        className="press flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-border text-lg font-bold text-text transition-colors hover:bg-tile disabled:opacity-30"
        disabled={value <= min}
        aria-label="Decrease"
      >
        −
      </button>
      <div className="min-w-20 text-center text-lg font-bold tabular-nums text-text">
        {value}
        {suffix && <span className="ml-1 text-sm font-medium text-muted">{suffix}</span>}
      </div>
      <button
        onClick={() => onChange(Math.round((value + step) * 100) / 100)}
        className="press flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-accent text-lg font-bold text-white transition-all hover:brightness-110"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}

/* ------------------------------- Toggle ------------------------------- */

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        void tapSoft()
        onChange(!checked)
      }}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 active:scale-95 ${checked ? 'bg-accent' : 'bg-border'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${checked ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  )
}

/* --------------------------- Section header --------------------------- */

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-sans text-[28px] font-extrabold leading-tight tracking-tight text-text sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </div>
  )
}
