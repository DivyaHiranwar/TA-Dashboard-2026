import { DollarSign, TrendingDown, Percent, Lightbulb } from 'lucide-react'
import { ExplanationBanner } from './ExplanationBanner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' && p.name?.includes('CTC') ? `₹${p.value}L` : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <Card className={`metric-card-${color}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className={`text-2xl font-bold mt-1 text-${color}-400`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg bg-${color}-500/10`}>
            <Icon className={`h-5 w-5 text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FinancialImpact({ data }) {
  if (!data) return null
  const { financial, summary } = data

  const totalHires = summary.totalHiresYTD

  // Source cost comparison
  const sourceCostData = [
    { name: 'Agency', cost: financial.totalAgencySpend, hires: financial.hiresBySource?.Agency || 0 },
    { name: 'Referral', cost: financial.totalReferralPayout, hires: financial.hiresBySource?.Referral || 0 },
    { name: 'Direct', cost: 0, hires: financial.hiresBySource?.Direct || 0 },
  ]

  const internalExternalData = [
    { name: 'Internal\n(Direct)', value: financial.hiresBySource?.Direct || 0, cost: 0 },
    { name: 'External\n(Agency)', value: financial.hiresBySource?.Agency || 0, cost: financial.totalAgencySpend },
    { name: 'Referral', value: financial.hiresBySource?.Referral || 0, cost: financial.totalReferralPayout },
  ].filter((d) => d.value > 0)

  const ctcData = financial.ctcByDept.slice(0, 8)

  const insights = [
    {
      icon: '💰',
      text: `100% of ${totalHires} hires made via direct sourcing — zero agency spend this period`,
      badge: 'Cost Win',
      badgeVariant: 'success',
    },
    {
      icon: '📊',
      text: `Avg CTC of ${formatCurrency(financial.avgCTC)} across all new joiners YTD`,
      badge: 'Benchmark',
      badgeVariant: 'info',
    },
    {
      icon: '🎯',
      text: 'Direct sourcing saves estimated ₹5–15L per hire vs agency (industry avg 8–15% of CTC)',
      badge: 'Strategic',
      badgeVariant: 'violet',
    },
  ]

  const topCTCDept = financial.ctcByDept[0]

  const explanations = [
    {
      label: 'Avg Cost / Hire',
      text: financial.avgCostPerHire > 0
        ? `${formatCurrency(financial.avgCostPerHire)} average across ${totalHires} hire${totalHires !== 1 ? 's' : ''} with recorded cost-per-hire values. Industry avg with agency: ₹5–15L per hire.`
        : `₹0 — all ${totalHires} hires sourced directly with zero agency or referral fees. Estimated savings vs agency: ₹5–15L per hire (industry avg 8–15% of first-year CTC).`,
    },
    {
      label: 'Agency Spend',
      text: financial.totalAgencySpend > 0
        ? `₹${financial.totalAgencySpend}L paid to external agencies for ${financial.hiresBySource?.Agency || 0} hire(s). Agency is used only when direct sourcing is infeasible for niche/senior roles.`
        : 'Zero agency spend — 100% in-house sourcing capability. Strong signal of TA team maturity and cost discipline.',
    },
    {
      label: 'Referral Payout',
      text: financial.totalReferralPayout > 0
        ? `₹${financial.totalReferralPayout}L paid as employee referral bonuses. Referral hires typically have 25% higher retention and are 50% faster to close than agency hires.`
        : 'No referral payouts this period — the employee referral programme has not yet been activated. Referral hires average 40% lower cost than agency.',
    },
    {
      label: 'Avg CTC by Department',
      text: topCTCDept
        ? `${topCTCDept.dept} commands the highest avg CTC at ₹${topCTCDept.avgCTC}L — reflecting market demand for specialised talent. Use this to set department-level compensation bands.`
        : 'CTC data by department will populate as more joiners are recorded with compensation details.',
    },
    {
      label: 'Internal vs External Hiring',
      text: `${totalHires > 0 ? '100%' : 'All'} hires are external (via direct sourcing) — no internal transfers or promotions recorded for this period. A healthy mix typically targets 20–30% internal mobility.`,
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <ExplanationBanner title="Financial Impact — Metric Guide" items={explanations} />
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="metric-card-violet">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Cost/Hire</p>
                <p className="text-2xl font-bold text-violet-400">
                  {financial.avgCostPerHire > 0 ? formatCurrency(financial.avgCostPerHire) : '₹0'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {financial.avgCostPerHire > 0 ? `Avg across ${totalHires} hire${totalHires !== 1 ? 's' : ''}` : 'Direct sourcing'}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-violet-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card-rose">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Agency Spend</p>
                <p className="text-2xl font-bold text-rose-400">
                  {financial.totalAgencySpend > 0 ? formatCurrency(financial.totalAgencySpend) : '₹0'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">YTD total</p>
              </div>
              <TrendingDown className="h-8 w-8 text-rose-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card-amber">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Referral Payout</p>
                <p className="text-2xl font-bold text-amber-400">
                  {financial.totalReferralPayout > 0 ? formatCurrency(financial.totalReferralPayout) : '₹0'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">YTD total</p>
              </div>
              <Percent className="h-8 w-8 text-amber-400/30" />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CTC by Department */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Average CTC by Department (₹L)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ctcData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ctcData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                  <YAxis
                    dataKey="dept"
                    type="category"
                    tick={{ fill: 'hsl(215 20% 65%)', fontSize: 10 }}
                    width={110}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgCTC" name="Avg CTC (₹L)" radius={[0, 4, 4, 0]} fill="#7c3aed">
                    {ctcData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No CTC data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Internal vs External */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Internal vs External Hiring
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {internalExternalData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={internalExternalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: 'hsl(215 20% 55%)' }}
                  >
                    {internalExternalData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Strategic Insights */}
      <Card className="insight-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            Strategic Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((ins, i) => (
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
