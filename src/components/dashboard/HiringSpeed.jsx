import { Clock, Zap, Target, AlertTriangle, Lightbulb, CheckCircle, XCircle } from 'lucide-react'
import { ExplanationBanner } from './ExplanationBanner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, PieChart, Pie, Legend, ReferenceLine
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const COLORS = ['#10b981', '#f59e0b', '#f43f5e']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.value} {p.name?.includes('days') || p.name === 'Hires' ? '' : 'days'}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function GaugeCard({ label, value, max, unit, color, description }) {
  const pct = Math.min((value / max) * 100, 100)
  const colorMap = {
    emerald: { text: 'text-emerald-400', bar: 'bg-emerald-500', indicator: '#10b981' },
    amber: { text: 'text-amber-400', bar: 'bg-amber-500', indicator: '#f59e0b' },
    rose: { text: 'text-rose-400', bar: 'bg-rose-500', indicator: '#f43f5e' },
    violet: { text: 'text-violet-400', bar: 'bg-violet-500', indicator: '#7c3aed' },
    cyan: { text: 'text-cyan-400', bar: 'bg-cyan-500', indicator: '#06b6d4' },
  }
  const c = colorMap[color] || colorMap.violet

  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
        <div className="flex items-end justify-between mb-3">
          <span className={`text-3xl font-bold ${c.text}`}>{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        <Progress
          value={pct}
          className="h-2"
          indicatorClassName={c.bar}
        />
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}

export function HiringSpeed({ data }) {
  if (!data) return null
  const { speed, volume } = data

  const slaMetData = [
    { name: 'On Track', value: speed.slaMetBreakdown.onTrack, color: '#10b981' },
    { name: 'Beyond 60d', value: speed.slaMetBreakdown.above60, color: '#f59e0b' },
    { name: 'Beyond 100d', value: speed.slaMetBreakdown.above100, color: '#f43f5e' },
  ].filter(d => d.value > 0)

  const tthData = speed.tthByRole.slice(0, 8)
  const velocityData = speed.hiringVelocity

  const slaColor = speed.slaAdherenceRate >= 90 ? 'emerald' : speed.slaAdherenceRate >= 70 ? 'amber' : 'rose'
  const tthColor = speed.avgTimeToHire <= 15 ? 'emerald' : speed.avgTimeToHire <= 30 ? 'amber' : 'rose'

  const slowestRole = tthData[0]
  const latestMonth = velocityData[velocityData.length - 1]

  const speedExplanations = [
    {
      label: 'Avg Time to Hire',
      text: `${speed.avgTimeToHire || '—'} days on average from first candidate screening to offer letter signing. Benchmark: ≤30 days. ${speed.avgTimeToHire > 0 && speed.avgTimeToHire <= 30 ? 'Currently within benchmark.' : speed.avgTimeToHire > 30 ? 'Exceeds benchmark — review interview stages for delays.' : 'Data will populate as hiring cycles complete.'}`,
    },
    {
      label: 'Avg Time to Fill',
      text: `${speed.avgTimeToFill || '—'} days from JD approval/opening to formal offer release. Longer than Time to Hire as it includes sourcing time. Industry benchmark: 45–60 days for mid-level roles.`,
    },
    {
      label: 'SLA Adherence',
      text: `${speed.slaAdherenceRate}% of positions were closed within the SLA committed to hiring managers. ${speed.slaAdherenceRate >= 90 ? 'Above 90% — excellent TA execution.' : speed.slaAdherenceRate >= 70 ? '70–90% — review delayed positions.' : 'Below 70% — systematic process review recommended.'}`,
    },
    {
      label: 'Hiring Velocity',
      text: latestMonth
        ? `${latestMonth.count} position${latestMonth.count !== 1 ? 's' : ''} closed in ${latestMonth.month} — the most recent month's throughput. Tracks the TA team's monthly output capacity.`
        : 'Velocity tracks how many positions are closed per month — will populate as data is recorded.',
    },
    {
      label: 'Time to Hire by Role',
      text: slowestRole
        ? `Roles beyond 30 days (shown in red) are flagged as bottlenecks. ${slowestRole.role} took the longest at ${slowestRole.days} days — typically caused by panel availability, niche skills, or counter-offer situations.`
        : 'Breakdown by role will populate once time-to-hire data is recorded for completed hires.',
    },
    {
      label: 'SLA Performance Distribution',
      text: `Pie chart showing proportion of hires completed: On Track (≤30d), Beyond 60d, and Beyond 100d. Hires in the "Beyond" categories need post-mortem review to identify and fix process gaps.`,
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <ExplanationBanner title="Speed & SLA — Metric Guide" items={speedExplanations} />
      {/* KPI Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GaugeCard
          label="Avg Time to Hire"
          value={speed.avgTimeToHire || '—'}
          max={60}
          unit="days"
          color={tthColor}
          description="Screening → Signing date"
        />
        <GaugeCard
          label="Avg Time to Fill"
          value={speed.avgTimeToFill || '—'}
          max={90}
          unit="days"
          color="violet"
          description="JD open → Offer release"
        />
        <GaugeCard
          label="SLA Adherence"
          value={speed.slaAdherenceRate}
          max={100}
          unit="%"
          color={slaColor}
          description="Positions closed within SLA"
        />
        <GaugeCard
          label="Hiring Velocity"
          value={velocityData.length > 0 ? velocityData[velocityData.length - 1]?.count || 0 : 0}
          max={20}
          unit="hires/mo"
          color="cyan"
          description="Latest month closed positions"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Time to Hire by Role */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Time to Hire by Role (days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={tthData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                  <YAxis
                    dataKey="role"
                    type="category"
                    tick={{ fill: 'hsl(215 20% 65%)', fontSize: 10 }}
                    width={120}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    x={30}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: 'SLA', fill: '#f59e0b', fontSize: 10 }}
                  />
                  <Bar dataKey="days" name="Days" radius={[0, 4, 4, 0]}>
                    {tthData.map((entry, i) => (
                      <Cell key={i} fill={entry.days > 30 ? '#f43f5e' : entry.days > 15 ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                No time-to-hire data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* SLA Met Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              SLA Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slaMetData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={slaMetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value, percent }) => `${value} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {slaMetData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
                No SLA data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hiring Velocity Line Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Hiring Velocity Trend (Positions Closed / Month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {velocityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={velocityData} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Hires" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">
              No velocity data
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottleneck Table */}
      {tthData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Hiring Timeline by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Time to Hire</TableHead>
                  <TableHead>SLA Status</TableHead>
                  <TableHead>SLA Bar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tthData.map((r, i) => {
                  const pct = Math.min((r.days / 30) * 100, 100)
                  return (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-medium">{r.role}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.dept}</TableCell>
                      <TableCell>
                        <span className={`text-sm font-bold ${r.days > 30 ? 'text-rose-400' : r.days > 15 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {r.days}d
                        </span>
                      </TableCell>
                      <TableCell>
                        {r.days > 30 ? (
                          <Badge variant="danger" className="text-[10px] flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" /> Exceeded
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px] flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" /> On Track
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <Progress
                          value={pct}
                          className="h-1.5 w-24"
                          indicatorClassName={r.days > 30 ? 'bg-rose-500' : r.days > 15 ? 'bg-amber-500' : 'bg-emerald-500'}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Strategic Insights */}
      <Card className="insight-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            Speed & SLA Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: '⚡',
                badge: 'Fast Closure',
                badgeVariant: 'success',
                text: `Avg ${speed.avgTimeToHire}d time-to-hire (screening→signing) — well within 30d benchmark`,
              },
              {
                icon: '🎯',
                badge: 'SLA Health',
                badgeVariant: speed.slaAdherenceRate >= 90 ? 'success' : 'warning',
                text: `${speed.slaAdherenceRate}% SLA adherence — ${speed.slaAdherenceRate >= 90 ? 'excellent execution' : 'review delayed positions'}`,
              },
              {
                icon: '🔍',
                badge: 'Bottleneck Watch',
                badgeVariant: 'info',
                text: tthData.length > 0 && tthData[0]?.days > 20
                  ? `${tthData[0]?.role} taking ${tthData[0]?.days}d — longest in pipeline, needs priority`
                  : 'No critical bottleneck roles detected — hiring running smoothly',
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
