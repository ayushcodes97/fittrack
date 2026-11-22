import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'

/**
 * Last line of defence: if any screen throws during render, the app shows a
 * calm recovery card instead of a blank white page. Local data is never
 * touched here — a reload simply re-reads the saved database.
 */

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // keep the technical detail in the console for debugging only
    console.error('FITTRACK screen crashed:', error, info.componentStack)
  }

  private retry = (): void => {
    this.setState({ error: null })
  }

  private reload = (): void => {
    window.location.reload()
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children

    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg px-5 py-10 text-text">
        <div className="w-full max-w-md rounded-[22px] border border-border bg-card p-6 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <AlertTriangle size={22} />
          </span>
          <h1 className="font-display text-xl font-semibold leading-snug">Something went wrong</h1>
          <p className="mt-1.5 text-sm text-muted">
            Your saved data is safe. Reload the app to continue where you left off.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              onClick={this.reload}
              className="press flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white transition-[filter] hover:brightness-105"
            >
              <RotateCw size={16} /> Reload app
            </button>
            <button
              type="button"
              onClick={this.retry}
              className="press flex h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-border bg-tile text-sm font-medium text-text transition-colors hover:bg-tile-hover"
            >
              Try again
            </button>
          </div>
          <p className="mt-4 break-words text-[11px] leading-relaxed text-muted/70">
            {this.state.error.message || 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
}
