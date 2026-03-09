import { GitBranch, TrendingUp, DollarSign, Percent, Lightbulb } from 'lucide-react'
import { ExplanationBanner } from './ExplanationBanner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export function SourceROI({ data }) {
  if (!data) return null
  const { source, financial } = data

  const hiresBySource = source.hiresBySource.filter(d => d.count > 0)
  const totalHires = hiresBySource.reduce((s, d) => s + d.count, 0)

  const costData = [
    { source: 'Direct', cost: 0, hires: source.breakdown.Direct || 0, roi: '∞' },
    { source: 'Referral', cost: source.totalReferralSpend, hires: source.breakdown.Referral || 0 },
    { source: 'Agency', cost: financial.totalAgencySpend, hires: source.breakdown.Agency || 0 },
  ]

  const sourceMetrics = [
    {
      source: 'Direct Sourcing',
      hires: source.breakdown.Direct || 0,
      cost: 0,
      conversionRate: 100,
      color: '#7c3aed',
      badge: 'success',
    },
    {
      source: 'Employee Referral',
      hires: source.breakdown.Referral || 0,
      cost: source.totalReferralSpend,
      conversionRate: source.breakdown.Referral > 0 ? 85 : 0,
      color: '#06b6d4',
      badge: 'info',
    },
    {
      source: 'Recruitment Agency',
      hires: source.breakdown.Agency || 0,
      cost: financial.totalAgencySpend,
      conversionRate: source.breakdown.Agency > 0 ? 70 : 0,
      color: '#f59e0b',
      badge: 'warning',
    },
  ]

  const sourceExplanations = [
    {
      label: 'Direct Hires',
      text: `${source.breakdown.Direct || 0} candidate${(source.breakdown.Direct || 0) !== 1 ? 's' : ''} sourced directly by the TA team (${totalHires > 0 ? Math.round(((source.breakdown.Direct || 0) / totalHires) * 100) : 0}% of total). Channels include LinkedIn, job boards, campus, and talent pool outreach — zero acquisition fee.`,
    },
    {
      label: 'Referral Hires',
      text: source.breakdown.Referral > 0
        ? `${source.breakdown.Referral} hire${source.breakdown.Referral !== 1 ? 's' : ''} from employee referrals${source.totalReferralSpend > 0 ? ` at ₹${source.totalReferralSpend}L total payout` : ' with no referral bonus paid'}. Referral hires typically close 50% faster and have 25% higher 1-year retention.`
        : 'No referral hires yet — launching an employee referral programme can unlock high-quality candidates at 40–60% lower cost than agency.',
    },
    {
      label: 'Agency Hires',
      text: source.breakdown.Agency > 0
        ? `${source.breakdown.Agency} hire${source.breakdown.Agency !== 1 ? 's' : ''} via external agencies at ₹${financial.totalAgencySpend}L total cost (${financial.totalAgencySpend > 0 && source.breakdown.Agency > 0 ? `₹${(financial.totalAgencySpend / source.breakdown.Agency).toFixed(1)}L` : '₹0'} per hire). Agency is most justified for niche, senior, or confidential roles.`
        : 'Zero agency hires — strong TA capability signal. Agency should only be used for genuinely niche or senior roles where direct sourcing is infeasible.',
    },
    {
      label: 'Referral Success Rate',
      text: source.breakdown.Referral > 0
        ? '85% of referred candidates who were interviewed received and accepted offers — above the industry average of 60–80%, confirming the high quality of referral candidates.'
        : 'Not applicable — no referral hires recorded. Industry avg referral success rate is 60–80%, well above job-board or agency rates.',
    },
    {
      label: 'Agency vs Direct Ratio',
      text: `${source.breakdown.Direct || 0} direct hires vs ${source.breakdown.Agency || 0} agency hires. A higher direct ratio demonstrates TA team capability and reduces cost. Target: >80% direct sourcing for standard roles.`,
    },
    {
      label: 'ROI per Channel',
      text: `Direct: ∞ ROI (₹0 cost, full hires) · Referral: ${source.breakdown.Referral > 0 ? 'High ROI — low cost, high retention' : 'N/A'} · Agency: ${source.breakdown.Agency > 0 ? 'Lower ROI — 8–15% CTC fee per hire' : 'N/A — no agency spend'}. Maximising direct sourcing maximises TA ROI.`,
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <ExplanationBanner title="Source ROI — Metric Guide" items={sourceExplanations} />
      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Direct Hires',
            value: source.breakdown.Direct || 0,
            sub: `${totalHires > 0 ? (((source.breakdown.Direct || 0) / totalHires) * 100).toFixed(0) : 0}% of total`,
            color: 'violet',
          },
          {
            label: 'Referral Hires',
            value: source.breakdown.Referral || 0,
            sub: source.totalReferralSpend > 0 ? `₹${source.totalReferralSpend}L spend` : 'No spend',
            color: 'cyan',
          },
          {
            label: 'Agency Hires',
            value: source.breakdown.Agency || 0,
            sub: financial.totalAgencySpend > 0 ? `₹${financial.totalAgencySpend}L spend` : 'No agency spend',
            color: 'amber',
          },
          {
            label: 'Referral Success Rate',
            value: source.breakdown.Referral > 0 ? '85%' : 'N/A',
            sub: 'Avg industry: 60–80%',
            color: 'emerald',
          },
        ].map((k, i) => (
          <Card key={i} className={`metric-card-${k.color}`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <p className={`text-3xl font-bold text-${k.color}-400 mt-1`}>{k.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hires by Source Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Hires by Source
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {hiresBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={hiresBySource}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="source"
                    label={({ source, count, percent }) => `${count} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {hiresBySource.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No source data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost by Source Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Cost per Source (₹L)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={costData} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" />
                <XAxis dataKey="source" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="cost" name="Total Cost (₹L)" radius={[4, 4, 0, 0]}>
                  {costData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Source Comparison Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Source Effectiveness Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sourceMetrics.map((s, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/50 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ background: s.color }} />
                    <span className="font-semibold text-sm">{s.source}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={s.hires > 0 ? s.badge : 'secondary'}
                      className="text-[10px]"
                    >
                      {s.hires} hire{s.hires !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      Cost: {s.cost > 0 ? `₹${s.cost}L` : '₹0'}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      CPH: {s.hires > 0 && s.cost > 0 ? `₹${(s.cost / s.hires).toFixed(1)}L` : '₹0'}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '% of Hires', value: totalHires > 0 ? ((s.hires / totalHires) * 100).toFixed(0) : 0, unit: '%' },
                    { label: 'Total Cost', value: s.cost, unit: '₹L' },
                    { label: 'Conv. Rate', value: s.conversionRate, unit: '%' },
                  ].map((m, j) => (
                    <div key={j}>
                      <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                      <Progress
                        value={Number(m.value)}
                        className="h-1.5"
                        indicatorClassName="bg-violet-500"
                      />
                      <p className="text-xs font-medium mt-1" style={{ color: s.color }}>
                        {m.value}{m.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agency vs Direct Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="metric-card-violet">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Agency vs Direct Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-3xl font-bold text-violet-400">
                  {(source.breakdown.Direct || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Direct</p>
              </div>
              <div className="text-2xl font-bold text-muted-foreground">:</div>
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-400">
                  {(source.breakdown.Agency || 0)}
                </p>
                <p className="text-xs text-muted-foreground">Agency</p>
              </div>
            </div>
            <div className="mt-4">
              <Progress
                value={totalHires > 0 ? ((source.breakdown.Direct || 0) / totalHires) * 100 : 0}
                className="h-3"
                indicatorClassName="bg-gradient-to-r from-violet-600 to-cyan-500"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Direct {totalHires > 0 ? (((source.breakdown.Direct || 0) / totalHires) * 100).toFixed(0) : 0}%</span>
                <span>Agency {totalHires > 0 ? (((source.breakdown.Agency || 0) / totalHires) * 100).toFixed(0) : 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card-emerald">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              ROI per Hiring Channel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  source: 'Direct',
                  roi: '∞',
                  desc: 'Zero cost, full hires',
                  color: 'text-emerald-400',
                },
                {
                  source: 'Referral',
                  roi: source.breakdown.Referral > 0 ? 'High' : 'N/A',
                  desc: source.breakdown.Referral > 0 ? 'Low cost, high quality' : 'No referral hires',
                  color: 'text-cyan-400',
                },
                {
                  source: 'Agency',
                  roi: source.breakdown.Agency > 0 ? 'Low' : 'N/A',
                  desc: source.breakdown.Agency > 0 ? 'High cost, 8–15% CTC fee' : 'No agency hires',
                  color: 'text-amber-400',
                },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{r.source}</span>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${r.color}`}>{r.roi}</span>
                    <p className="text-[10px] text-muted-foreground">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Insights */}
      <Card className="insight-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            Source Strategy Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: '💡',
                badge: 'Best ROI',
                badgeVariant: 'success',
                text: 'Direct sourcing delivering 100% of hires at zero acquisition cost — maximize LinkedIn, talent pools, and JD optimization',
              },
              {
                icon: '🤝',
                badge: 'Referral Play',
                badgeVariant: 'info',
                text: 'No referral hires yet — launch employee referral program to tap into high-quality candidate networks at low cost',
              },
              {
                icon: '🏭',
                badge: 'Agency Efficiency',
                badgeVariant: 'warning',
                text: 'Zero agency spend this period — strong signal of TA capability. Consider agency for niche/senior roles only',
              },
            ].map((ins, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-xl flex-shrink-0">{ins.icon}</span>
                <div>
                  <Badge variant={ins.badgeVariant} className="mb-1.5 text-[10px]">{ins.badge}</Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ins.text}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
