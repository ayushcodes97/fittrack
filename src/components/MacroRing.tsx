import type { ReactNode } from 'react'

/**
 * Donut ring showing the three macro energy-shares (protein / carbs / fat)
 * as coloured segments. Children render in the ring's centre (e.g. kcal).
 * Shared by Diets (plan rings) and Progress (macro distribution).
 */
export function MacroRing({
  p, c, f, size = 96, stroke = 10, children,
}: {
  p: number; c: number; f: number; size?: number; stroke?: number; children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const gap = circ * 0.015
  const segs = [
    { color: 'var(--color-protein)', frac: p / 100 },
    { color: 'var(--color-carbs)', frac: c / 100 },
    { color: 'var(--color-fat)', frac: f / 100 },
  ]
  let acc = 0
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-border)" strokeWidth={stroke} fill="none" />
        {segs.map((s, i) => {
          const len = Math.max(0, circ * s.frac - gap)
          const dash = `${len} ${circ - len}`
          const offset = -acc
          acc += circ * s.frac
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={s.color}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={dash}
              strokeDashoffset={offset}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  )
}

export function MacroLegend({ p, c, f }: { p: number; c: number; f: number }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] font-semibold text-muted">
      <span className="flex shrink-0 items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-protein" /> Protein {p}%
      </span>
      <span className="flex shrink-0 items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-carbs" /> Carbs {c}%
      </span>
      <span className="flex shrink-0 items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-fat" /> Fat {f}%
      </span>
    </div>
  )
}
