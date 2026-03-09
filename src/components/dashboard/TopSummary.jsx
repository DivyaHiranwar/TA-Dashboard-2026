import { Users, DollarSign, Clock, Target, TrendingUp, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react'
import { formatCurrency, formatRupee, formatPercent, formatDays } from '@/lib/utils'
import { ExplanationBanner } from './ExplanationBanner'

function MetricCard({ icon: Icon, label, value, sub, color, trend }) {
  const colorMap = {
    violet: 'metric-card-violet',
    cyan: 'metric-card-cyan',
    emerald: 'metric-card-emerald',
    amber: 'metric-card-amber',
    rose: 'metric-card-rose',
    sky: 'metric-card-sky',
  }

  const iconColorMap = {
    violet: 'text-violet-400',
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    sky: 'text-sky-400',
  }

  const glowMap = {
    violet: 'shadow-violet-500/10',
    cyan: 'shadow-cyan-500/10',
    emerald: 'shadow-emerald-500/10',
    amber: 'shadow-amber-500/10',
    rose: 'shadow-rose-500/10',
    sky: 'shadow-sky-500/10',
  }

  return (
    <div className={`rounded-xl p-4 ${colorMap[color]} shadow-lg ${glowMap[color]} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider truncate">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${iconColorMap[color]}`}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1 truncate">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-background/30 ${iconColorMap[color]} ml-2 flex-shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  )
}

export function TopSummary({ data }) {
  if (!data) return null
  const { summary } = data

  const metrics = [
    {
      icon: Users,
      label: 'Total Hires YTD',
      value: summary.totalHiresYTD,
      sub: `MTD: ${summary.totalHiresMTD} · QTD: ${summary.totalHiresQTD}`,
      color: 'violet',
    },
    {
      icon: DollarSign,
      label: 'Avg Cost / Hire',
      value: summary.avgCostPerHire > 0 ? formatRupee(summary.avgCostPerHire) : '₹0',
      sub: 'All direct sourcing',
      color: 'cyan',
    },
    {
      icon: Clock,
      label: 'Avg Time to Fill',
      value: summary.avgTimeToFill ? `${summary.avgTimeToFill}d` : '—',
      sub: 'JD open → Offer release',
      color: 'amber',
    },
    {
      icon: Target,
      label: 'Offer Acceptance',
      value: `${summary.offerJoinRatio.toFixed(0)}%`,
      sub: `${summary.totalJoined} joined / ${summary.totalOffered} offered`,
      color: 'emerald',
    },
    {
      icon: CheckCircle2,
      label: 'SLA Adherence',
      value: `${summary.slaAdherenceRate}%`,
      sub: 'All active positions',
      color: 'sky',
    },
    {
      icon: Briefcase,
      label: 'Open Positions',
      value: summary.openPositions,
      sub: `${summary.onHoldPositions} on hold · ${summary.pipelineCount} pipeline`,
      color: 'rose',
    },
  ]

  // Build candidate name lists for offer acceptance explanation
  const offered = data.volume?.offeredRows || []
  const joinedNames = offered.filter(r => r.joined && !r.isFuture).map(r => r.candidate && r.candidate !== '—' ? r.candidate : r.role).filter(Boolean).join(', ')
  const futureNames = offered.filter(r => r.isFuture).map(r => r.candidate && r.candidate !== '—' ? r.candidate : r.role).filter(Boolean).join(', ')

  const explanations = [
    {
      label: 'Total Hires YTD',
      text: `${summary.totalHiresYTD} employees have officially joined iMocha in 2026 — ${summary.totalHiresMTD} in March (MTD) and ${summary.totalHiresQTD} across Q1. Counts only candidates whose date-of-joining has passed.`,
    },
    {
      label: 'Avg Cost / Hire',
      text: `All ${summary.totalHiresYTD} hires made via direct sourcing — zero agency fees or referral payouts incurred. Industry avg with agency is ₹5–15L per hire.`,
    },
    {
      label: 'Avg Time to Fill',
      text: `${summary.avgTimeToFill ? `${summary.avgTimeToFill} days` : 'Not yet recorded'} on average from JD opening to offer release. Industry benchmark is 45–60 days; lower indicates faster sourcing efficiency.`,
    },
    {
      label: 'Offer Acceptance',
      text: `${summary.totalJoined} of ${summary.totalOffered} offered candidates have joined (${summary.offerJoinRatio.toFixed(0)}%).${joinedNames ? ` Joined: ${joinedNames}.` : ''}${futureNames ? ` Awaiting joining: ${futureNames}.` : ''}`,
    },
    {
      label: 'SLA Adherence',
      text: `${summary.slaAdherenceRate}% of positions were closed within the SLA timeline committed to hiring managers. Tracks TA team's process discipline and delivery speed.`,
    },
    {
      label: 'Open Positions',
      text: `${summary.openPositions} active JDs currently in recruitment, with ${summary.onHoldPositions} paused (budget/approval pending) and ${summary.pipelineCount} candidate(s) in the final offer/signing stage.`,
    },
  ]

  return (
    <div className="px-6 py-4 border-b border-border/50 space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m, i) => (
          <MetricCard key={i} {...m} />
        ))}
      </div>
      <ExplanationBanner title="Key Metric Guide" items={explanations} />
    </div>
  )
}
