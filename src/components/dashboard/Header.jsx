import { RefreshCw, Clock, Wifi, WifiOff, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

const IMOCHA_LOGO = '/imocha.jpeg'

export function Header({ onRefresh, loading, lastRefresh, error, onExport, exporting }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/80">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo + Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-md">
              <img
                src={IMOCHA_LOGO}
                alt="iMocha"
                className="h-10 w-10 object-cover"
              />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-none">
                <span className="text-violet-400">iMocha</span> Talent Acquisition
              </h1>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-medium tracking-wider uppercase">
                Live Recruitment Intelligence Dashboard · 2026
              </p>
            </div>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {error ? (
              <Badge variant="danger" className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Data Error
              </Badge>
            ) : (
              <Badge variant="success" className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Live
              </Badge>
            )}
          </div>

          {/* Last refresh time */}
          {lastRefresh && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5 border border-border/50">
              <Clock className="h-3 w-3" />
              <span>Updated {format(lastRefresh, 'dd MMM, HH:mm:ss')}</span>
            </div>
          )}

          {/* Export PDF button */}
          {onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              disabled={exporting || loading}
              className="flex items-center gap-2 border border-border/60 hover:border-violet-500/50 hover:text-violet-300"
            >
              <FileDown className={`h-3.5 w-3.5 ${exporting ? 'animate-pulse' : ''}`} />
              {exporting ? 'Generating…' : 'Export PDF'}
            </Button>
          )}

          {/* Refresh button */}
          <Button
            variant="gradient"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing…' : 'Refresh Data'}
          </Button>
        </div>
      </div>

      {/* Loading progress bar */}
      {loading && (
        <div className="h-0.5 w-full bg-border overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-600 via-cyan-500 to-violet-600 animate-shimmer bg-[length:200%_100%]" />
        </div>
      )}
    </header>
  )
}
