import { TrendingUp, Award, AlertTriangle, Lightbulb } from 'lucide-react'
import { ExplanationBanner } from './ExplanationBanner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, ZAxis, Cell, ReferenceLine
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.name?.includes('CTC') || p.name?.includes('ctc') ? `₹${p.value}L` : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function CompensationTrends({ data }) {
  if (!data) return null
  const { compensation } = data

  const joiners = compensation.newJoiners
  const ctcByDept = compensation.ctcByDept.slice(0, 8)
  const trendData = compensation.ctcTrendData

  const maxCTC = compensation.maxCTC
  const minCTC = compensation.minCTC === Infinity ? 0 : compensation.minCTC

  const highestCTCJoiner = joiners.reduce((best, j) => (!best || j.ctc > best.ctc ? j : best), null)
  const lowestCTCJoiner = joiners.reduce((best, j) => (!best || (j.ctc > 0 && j.ctc < best.ctc) ? j : best), null)

  const compExplanations = [
    {
      label: 'Avg CTC Offered',
      text: `₹${compensation.avgCTC.toFixed(1)}L is the mean annual package offered across all ${joiners.length} recorded joiner${joiners.length !== 1 ? 's' : ''}. Engineering and product roles typically command a premium above this average.`,
    },
    {
      label: 'Max CTC',
      text: maxCTC > 0
        ? `₹${maxCTC}L — highest individual package offered this period${highestCTCJoiner ? ` (${highestCTCJoiner.candidate}, ${highestCTCJoiner.role})` : ''}. Benchmarks against senior/specialist market rates.`
        : 'Max CTC will populate once compensation data is recorded for new joiners.',
    },
    {
      label: 'Min CTC',
      text: minCTC > 0
        ? `₹${minCTC}L — entry-level package this hiring cycle${lowestCTCJoiner ? ` (${lowestCTCJoiner.candidate}, ${lowestCTCJoiner.role})` : ''}. Indicates the lower bound of the company's active compensation band.`
        : 'Min CTC will populate once compensation data is recorded.',
    },
    {
      label: 'Offer-Join Ratio',
      text: `${compensation.offerJoinRatio}% of candidates who received an offer subsequently joined. Drops below 85% may signal counter-offer situations, competitor pulls, or CTC misalignment during hiring.`,
    },
    {
      label: 'CTC Trend by Month',
      text: trendData.length >= 2
        ? `Avg CTC moved from ₹${trendData[0]?.avgCTC}L (${trendData[0]?.month}) to ₹${trendData[trendData.length - 1]?.avgCTC}L (${trendData[trendData.length - 1]?.month}). Rising trend may indicate salary inflation; monitor against budget.`
        : 'Monthly CTC trend will appear as hiring data is recorded across multiple months.',
    },
    {
      label: 'New Joiners Table',
      text: `Lists every hire with name, role, department, CTC, and joining date. The CTC Range bar shows each person's package as a percentage of the highest offer this period (₹${maxCTC > 0 ? maxCTC : '—'}L).`,
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <ExplanationBanner title="Compensation Trends — Metric Guide" items={compExplanations} />
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Avg CTC Offered',
            value: `₹${compensation.avgCTC.toFixed(1)}L`,
            sub: 'Across all hires',
            color: 'violet',
          },
          {
            label: 'Max CTC',
            value: `₹${maxCTC > 0 ? maxCTC : '—'}L`,
            sub: 'Highest offer',
            color: 'emerald',
          },
          {
            label: 'Min CTC',
            value: minCTC > 0 ? `₹${minCTC}L` : '—',
            sub: 'Entry level offer',
            color: 'sky',
          },
          {
            label: 'Offer-Join Ratio',
            value: `${compensation.offerJoinRatio}%`,
            sub: 'Offers converted',
            color: 'amber',
          },
        ].map((k, i) => (
          <Card key={i} className={`metric-card-${k.color}`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <p className={`text-2xl font-bold text-${k.color}-400 mt-1`}>{k.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CTC by Dept */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Avg CTC by Department (₹L)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ctcByDept.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ctcByDept} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                  <YAxis dataKey="dept" type="category" tick={{ fill: 'hsl(215 20% 65%)', fontSize: 10 }} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    x={compensation.avgCTC}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{ value: 'Avg', fill: '#f59e0b', fontSize: 10 }}
                  />
                  <Bar dataKey="avgCTC" name="Avg CTC (₹L)" radius={[0, 4, 4, 0]}>
                    {ctcByDept.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No CTC data
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTC trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              CTC Trend by Month (₹L)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData} margin={{ left: 0, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="avgCTC"
                    name="Avg CTC (₹L)"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    dot={{ fill: '#7c3aed', r: 4 }}
                    activeDot={{ r: 6, fill: '#a78bfa' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                Insufficient trend data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Joiners CTC List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
            New Joiners with CTC
            <Badge variant="violet">{joiners.length} records</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>CTC (₹L)</TableHead>
                  <TableHead>CTC Range</TableHead>
                  <TableHead>DOJ</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {joiners.map((j, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm font-medium">{j.candidate}</TableCell>
                    <TableCell className="text-xs max-w-[160px] truncate text-muted-foreground">{j.role}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{j.dept}</TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-violet-400">₹{j.ctc}L</span>
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={maxCTC > 0 ? (j.ctc / maxCTC) * 100 : 0}
                          className="h-1.5 w-16"
                          indicatorClassName="bg-violet-500"
                        />
                        <span className="text-xs text-muted-foreground">
                          {maxCTC > 0 ? `${((j.ctc / maxCTC) * 100).toFixed(0)}%` : ''}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {j.doj ? format(j.doj, 'dd MMM yyyy') : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">{j.month}</Badge>
                    </TableCell>
                    <TableCell>
                      {j.isFuture ? (
                        <Badge variant="warning" className="text-[10px]">Future</Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px]">Joined</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Offer Drop Analysis */}
      {Object.keys(compensation.offerDrops).length > 0 && (
        <Card className="metric-card-rose">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span className="text-muted-foreground uppercase tracking-wider text-xs">Offer Drop Reasons</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(compensation.offerDrops).map(([reason, count], i) => (
                <div key={i} className="p-3 rounded-lg bg-background/40 border border-rose-500/20 text-center">
                  <p className="text-xl font-bold text-rose-400">{count}</p>
                  <p className="text-xs text-muted-foreground mt-1">{reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strategic Insights */}
      <Card className="insight-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            Compensation Strategic Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: '📊',
                badge: 'Market Check',
                badgeVariant: 'info',
                text: `Average CTC ₹${compensation.avgCTC.toFixed(1)}L — engineering roles commanding premium vs median market rates`,
              },
              {
                icon: '🎯',
                badge: 'Compression Risk',
                badgeVariant: 'warning',
                text: 'High spread between min and max CTC indicates compensation band inconsistency — review band structures',
              },
              {
                icon: '📈',
                badge: 'Inflation Watch',
                badgeVariant: 'violet',
                text: trendData.length >= 2
                  ? `CTC moved from ₹${trendData[0]?.avgCTC}L to ₹${trendData[trendData.length - 1]?.avgCTC}L — monitor for budget overrun`
                  : 'Track monthly CTC trends to identify salary inflation patterns',
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
