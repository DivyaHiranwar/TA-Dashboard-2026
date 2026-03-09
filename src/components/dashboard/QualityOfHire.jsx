import { Star, Shield, TrendingDown, Award, Lightbulb } from 'lucide-react'
import { ExplanationBanner } from './ExplanationBanner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Cell, PolarAngleAxis
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const COLORS = ['#10b981', '#7c3aed', '#06b6d4', '#f59e0b', '#f43f5e']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}%</p>
        ))}
      </div>
    )
  }
  return null
}

function MetricGauge({ label, value, max = 100, color, icon: Icon, sub }) {
  const pct = Math.min((value / max) * 100, 100)
  const colorMap = {
    emerald: { text: 'text-emerald-400', bar: 'bg-emerald-500', card: 'metric-card-emerald' },
    amber: { text: 'text-amber-400', bar: 'bg-amber-500', card: 'metric-card-amber' },
    rose: { text: 'text-rose-400', bar: 'bg-rose-500', card: 'metric-card-rose' },
    violet: { text: 'text-violet-400', bar: 'bg-violet-500', card: 'metric-card-violet' },
    cyan: { text: 'text-cyan-400', bar: 'bg-cyan-500', card: 'metric-card-cyan' },
  }
  const c = colorMap[color] || colorMap.emerald

  return (
    <Card className={c.card}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <Icon className={`h-4 w-4 ${c.text}`} />
        </div>

        {/* Circular indicator */}
        <div className="flex items-center justify-center my-2">
          <div className="relative h-28 w-28">
            <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(217 33% 22%)" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={c.text.replace('text-', '').includes('emerald') ? '#10b981' :
                        c.text.includes('amber') ? '#f59e0b' :
                        c.text.includes('rose') ? '#f43f5e' :
                        c.text.includes('violet') ? '#7c3aed' : '#06b6d4'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${pct * 3.14} 314`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${c.text}`}>{value}%</span>
            </div>
          </div>
        </div>

        {sub && <p className="text-xs text-muted-foreground text-center mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export function QualityOfHire({ data }) {
  if (!data) return null
  const { quality } = data

  const retentionByDept = quality.retentionByDept
  const sourceQuality = quality.sourceQuality

  const qualityExplanations = [
    {
      label: '90-Day Retention',
      text: `${quality.avgRetention}% of new hires remain employed 90 days after their date-of-joining. This is the primary quality-of-hire signal. ${quality.avgRetention >= 90 ? 'Above 90% target — strong role-fit and onboarding.' : 'Below 90% — review onboarding experience, role clarity, and interview rigour.'}`,
    },
    {
      label: 'Early Attrition (0–6m)',
      text: `${quality.avgAttrition}% of hires left within the first 6 months. Target is <5%. ${quality.avgAttrition <= 5 ? 'Within healthy range — hiring quality and expectations are well-calibrated.' : 'Above 5% — signals potential mismatch in role expectations, hiring quality, or onboarding gaps.'}`,
    },
    {
      label: 'HM Satisfaction',
      text: 'Hiring manager rating of the new joiner\'s quality and fit on a 1–5 scale. Score collection is pending — typically captured at 30/60/90-day check-ins after joining.',
    },
    {
      label: 'Critical Role Retention',
      text: quality.criticalHireRetention > 0
        ? `${quality.criticalHireRetention.toFixed(0)}% 90-day retention for critical/high-impact roles (target: 95%). Early exits in critical roles cause significant business disruption and are tracked separately.`
        : 'Critical role retention will populate once 90-day data is available for critical-flagged hires.',
    },
    {
      label: '90-Day Retention by Department',
      text: 'Shows which departments retain new hires best at the 90-day mark. Green (≥90%) is target; amber (75–89%) needs attention; red (<75%) requires immediate onboarding and role-fit review.',
    },
    {
      label: 'Quality by Hiring Source',
      text: 'Compares 90-day retention and early attrition across Direct, Referral, and Agency sourcing channels. Helps identify which channels produce highest-quality, best-fit hires.',
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <ExplanationBanner title="Quality of Hire — Metric Guide" items={qualityExplanations} />
      {/* Gauge Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricGauge
          label="90-Day Retention"
          value={quality.avgRetention}
          color="emerald"
          icon={Shield}
          sub="All new hires"
        />
        <MetricGauge
          label="Early Attrition (0–6m)"
          value={quality.avgAttrition}
          color={quality.avgAttrition > 10 ? 'rose' : 'amber'}
          icon={TrendingDown}
          sub="Lower is better"
        />
        <Card className="metric-card-violet">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">HM Satisfaction</p>
              <Star className="h-4 w-4 text-violet-400" />
            </div>
            <div className="flex items-center justify-center my-2">
              <div className="text-center">
                <p className="text-4xl font-bold text-violet-400">—</p>
                <p className="text-xs text-muted-foreground mt-2">Score pending</p>
              </div>
            </div>
            <div className="flex justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-4 w-4 text-border fill-border" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="metric-card-cyan">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Critical Role Retention</p>
              <Award className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="flex items-center justify-center my-2">
              <div className="text-center">
                <p className="text-4xl font-bold text-cyan-400">
                  {quality.criticalHireRetention > 0 ? `${quality.criticalHireRetention.toFixed(0)}%` : '—'}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">90-day for critical hires</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Retention by Department */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              90-Day Retention by Department (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {retentionByDept.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={retentionByDept} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                  <YAxis dataKey="dept" type="category" tick={{ fill: 'hsl(215 20% 65%)', fontSize: 10 }} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="retention" name="Retention %" radius={[0, 4, 4, 0]}>
                    {retentionByDept.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.retention >= 90 ? '#10b981' : entry.retention >= 75 ? '#f59e0b' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No retention data by department
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Quality */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Quality by Hiring Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sourceQuality.length > 0 ? (
              <div className="space-y-4 pt-4">
                {sourceQuality.map((s, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{s.source}</span>
                      <div className="flex gap-2">
                        <Badge variant="success" className="text-[10px]">
                          Ret: {s.avgRetention}%
                        </Badge>
                        <Badge variant={s.avgAttrition > 5 ? 'danger' : 'secondary'} className="text-[10px]">
                          Attr: {s.avgAttrition}%
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={s.avgRetention}
                      className="h-2"
                      indicatorClassName={
                        s.avgRetention >= 90 ? 'bg-emerald-500' :
                        s.avgRetention >= 75 ? 'bg-amber-500' : 'bg-rose-500'
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No source quality data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quality Score Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Quality of Hire Score Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: '90-Day Retention',
                value: quality.avgRetention,
                target: 90,
                unit: '%',
                color: quality.avgRetention >= 90 ? 'emerald' : 'amber',
              },
              {
                label: 'Early Attrition',
                value: quality.avgAttrition,
                target: 5,
                unit: '%',
                color: quality.avgAttrition <= 5 ? 'emerald' : 'rose',
                inverted: true,
              },
              {
                label: 'Critical Retention',
                value: quality.criticalHireRetention > 0 ? quality.criticalHireRetention.toFixed(0) : null,
                target: 95,
                unit: '%',
                color: 'cyan',
              },
              {
                label: 'HM Satisfaction',
                value: null,
                target: 4.5,
                unit: '/5',
                color: 'violet',
              },
            ].map((m, i) => {
              const colorMap = {
                emerald: 'text-emerald-400',
                amber: 'text-amber-400',
                rose: 'text-rose-400',
                violet: 'text-violet-400',
                cyan: 'text-cyan-400',
              }
              return (
                <div key={i} className="p-4 rounded-xl bg-muted/40 border border-border/50 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{m.label}</p>
                  <p className={`text-2xl font-bold ${colorMap[m.color]}`}>
                    {m.value !== null && m.value !== undefined ? `${m.value}${m.unit}` : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Target: {m.target}{m.unit}</p>
                  {m.value !== null && m.value !== undefined && (
                    <Badge
                      variant={
                        m.inverted
                          ? m.value <= m.target ? 'success' : 'danger'
                          : m.value >= m.target ? 'success' : 'warning'
                      }
                      className="mt-2 text-[10px]"
                    >
                      {m.inverted
                        ? m.value <= m.target ? '✓ Good' : '↑ High'
                        : m.value >= m.target ? '✓ Met' : '↓ Below'}
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Strategic Insights */}
      <Card className="insight-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            Quality of Hire Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: '🏆',
                badge: '90-Day Score',
                badgeVariant: quality.avgRetention >= 90 ? 'success' : 'warning',
                text: `${quality.avgRetention}% 90-day retention — ${quality.avgRetention >= 90 ? 'above benchmark. Strong onboarding signals' : 'below 90% target. Review onboarding process'}`,
              },
              {
                icon: '⚠️',
                badge: 'Attrition Risk',
                badgeVariant: quality.avgAttrition <= 5 ? 'success' : 'danger',
                text: `${quality.avgAttrition}% early attrition (0–6m) — ${quality.avgAttrition <= 5 ? 'healthy range' : 'review hiring quality and role fit'}`,
              },
              {
                icon: '🔬',
                badge: 'Source ROI',
                badgeVariant: 'info',
                text: 'Direct sourcing shows strong retention signals — maintaining quality while reducing cost per hire',
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
