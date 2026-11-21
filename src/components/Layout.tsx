import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import {
  Dumbbell,
  GlassWater,
  Home,
  Salad,
  Scale,
  ScanLine,
  Search,
  TrendingUp,
  User,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { useApp } from '../store/AppContext'
import { LogoMark } from './LogoMark'
import { tapSoft } from '../utils/haptics'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/diary', label: 'Food Diary', icon: UtensilsCrossed },
  { to: '/search', label: 'Food Search', icon: Search },
  { to: '/scan', label: 'Scan Food', icon: ScanLine },
  { to: '/diets', label: 'Diets', icon: Salad },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/water', label: 'Water', icon: GlassWater },
  { to: '/activity', label: 'Activity', icon: Dumbbell },
  { to: '/weight', label: 'Weight', icon: Scale },
  { to: '/profile', label: 'Profile', icon: User },
]

const MOBILE_NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/diary', label: 'Diary', icon: UtensilsCrossed },
  { to: '/diets', label: 'Diets', icon: Salad },
  { to: '/activity', label: 'Activity', icon: Dumbbell },
  { to: '/profile', label: 'Profile', icon: User },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
        <LogoMark size={21} />
      </div>
      <span className="font-display text-xl font-semibold tracking-tight text-text">
        FIT<span className="text-accent">TRACK</span>
      </span>
    </div>
  )
}

function SidebarProfile() {
  const { profile } = useApp()
  const firstName = profile.name.trim().split(' ')[0]
  const initials = profile.name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <NavLink
      to="/profile"
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors hover:bg-tile"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-dim text-sm font-bold text-accent">
        {initials || <User size={17} />}
      </div>
      <div className="min-w-0">
        <p className={`truncate text-sm font-semibold ${firstName ? 'text-text' : 'text-muted'}`}>
          {firstName || 'Set up your profile'}
        </p>
        <p className="truncate text-xs capitalize text-muted">{profile.goal} weight</p>
      </div>
    </NavLink>
  )
}

export default function Layout() {
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="min-h-dvh bg-bg text-text">
      {/* ---------- Desktop sidebar ---------- */}
      <aside className="glass-strong fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border p-5 lg:flex">
        <div className="px-1 py-2">
          <Logo />
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => void tapSoft()}
              className={({ isActive }) =>
                `press flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? 'bg-accent-dim text-accent'
                    : 'text-muted hover:bg-tile hover:text-text'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <SidebarProfile />
      </aside>

      {/* ---------- Mobile top bar ---------- */}
      <header className="glass-strong chrome-edge sticky top-0 z-40 flex items-center justify-between border-b px-4 pb-3 pt-[calc(0.75rem+var(--safe-top))] lg:hidden">
        <Logo />
      </header>

      {/* ---------- Main content ---------- */}
      <main className="relative z-10 w-full pb-[calc(6.5rem+var(--safe-bottom))] lg:pb-10 lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 lg:px-8 lg:pt-8">
          <div key={location.pathname} className="animate-rise">
            <Outlet />
          </div>
        </div>
      </main>

      {/* ---------- Mobile floating glass tab bar ---------- */}
      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(0.65rem+var(--safe-bottom))] lg:hidden">
        <div className="nav-glass pointer-events-auto flex w-full max-w-md items-stretch gap-1 rounded-[24px] border p-1.5">
          {MOBILE_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => void tapSoft()}
              className={({ isActive }) =>
                `press relative flex flex-1 flex-col items-center justify-center gap-1 rounded-[19px] px-1 py-2 text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? 'text-accent' : 'text-muted active:text-text'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="liquid-pill" aria-hidden="true" />}
                  <Icon size={20} strokeWidth={isActive ? 2.3 : 1.85} className="relative" />
                  <span className="relative leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
