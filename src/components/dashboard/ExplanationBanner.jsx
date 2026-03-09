import { Info } from 'lucide-react'

export function ExplanationBanner({ title = 'Metric Guide', items = [] }) {
  if (!items.length) return null
  return (
    <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Info className="h-3.5 w-3.5 text-sky-400 flex-shrink-0" />
        <p className="text-xs font-semibold text-sky-400 uppercase tracking-wider">{title}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2 text-xs leading-relaxed">
            <span className="font-semibold text-foreground/80 whitespace-nowrap flex-shrink-0">
              {item.label}:
            </span>
            <span className="text-muted-foreground">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
