import { useState } from 'react'
import { Users, TrendingUp, GitBranch, CalendarDays, Lightbulb, ChevronRight, TrendingDown } from 'lucide-react'
import { ExplanationBanner } from './ExplanationBanner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, ReferenceDot, Area, AreaChart, ComposedChart
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#14b8a6']

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

export function HiringVolume({ data, fullData, selectedMonths = [] }) {
  const [selectedDept, setSelectedDept] = useState(null)

  if (!data) return null
  const { volume, summary } = data

  // Full all-time velocity from base data, enriched with "highlighted" flag for filter
  const allTimeVelocity = (fullData?.volume?.velocityData || volume.velocityData).map((d) => ({
    ...d,
    highlighted: selectedMonths.length === 0 || selectedMonths.includes(d.month),
  }))

  const replacementData = [
    { name: 'Replacement', value: volume.replacementCount, color: '#7c3aed' },
    { name: 'New Position', value: volume.newPositionCount, color: '#06b6d4' },
  ].filter(d => d.value > 0)

  const revenueData = [
    { name: 'Revenue', value: volume.revenueHires, color: '#10b981' },
    { name: 'Enabling', value: volume.supportHires, color: '#f59e0b' },
  ].filter(d => d.value > 0)

  const criticalData = [
    { name: 'Critical', value: volume.criticalHires, color: '#f43f5e' },
    { name: 'Non-Critical', value: volume.nonCriticalHires, color: '#8b5cf6' },
  ].filter(d => d.value > 0)

  const deptPositions = selectedDept
    ? data.rawRows.filter((r) => r.dept === selectedDept && r.joined > 0)
    : []

  const offeredJoined = volume.offeredRows
  const futureCount = offeredJoined.filter(r => r.isFuture).length
  const joinedCount = offeredJoined.filter(r => r.joined && !r.isFuture).length
  const totalOffered = offeredJoined.length

  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isHighlighted = selectedMonths.length === 0 || selectedMonths.includes(label)
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-sm">
          <p className="font-medium text-foreground mb-1">{label}</p>
          <p style={{ color: '#7c3aed' }}>Hires: <strong>{payload[0]?.value}</strong></p>
          {selectedMonths.length > 0 && (
            <p className={`text-xs mt-1 ${isHighlighted ? 'text-violet-400' : 'text-muted-foreground'}`}>
              {isHighlighted ? '✓ Selected month' : 'Not in filter'}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const topDept = volume.byDept[0]
  const velocityStr = allTimeVelocity.map(d => `${d.month}: ${d.count}`).join(' → ')

  const volExplanations = [
    {
      label: 'Monthly Hires Trend',
      text: `Hiring velocity across months — ${velocityStr || 'data loading'}. Each data point represents the number of candidates whose joining date falls in that month.`,
    },
    {
      label: 'MTD / QTD / YTD',
      text: `MTD (${volume.mtd} hires in March) tracks this month's pace; QTD (${volume.qtd}) covers Q1 Jan–Mar; YTD (${volume.ytd}) is the full 2026 total. Used to benchmark against headcount plan.`,
    },
    {
      label: 'Hires by Department',
      text: topDept
        ? `${topDept.fullDept || topDept.dept} leads with ${topDept.count} hire${topDept.count !== 1 ? 's' : ''}. Click any bar to drill down and see individual roles and candidate names within that department.`
        : 'Department breakdown populates as hiring data is recorded.',
    },
    {
      label: 'Replacement vs New Position',
      text: `${volume.replacementCount} replacement hire${volume.replacementCount !== 1 ? 's' : ''} (backfill for departed employees) and ${volume.newPositionCount} new-position hire${volume.newPositionCount !== 1 ? 's' : ''} (org growth). A high new-position ratio signals company expansion.`,
    },
    {
      label: 'Revenue vs Enabling Function',
      text: `${volume.revenueHires} revenue-generating hire${volume.revenueHires !== 1 ? 's' : ''} (Sales, Customer Success, Product) vs ${volume.supportHires} enabling-function hire${volume.supportHires !== 1 ? 's' : ''} (HR, Finance, Admin). Revenue-first ratio indicates growth-stage focus.`,
    },
    {
      label: 'Critical vs Non-Critical',
      text: `${volume.criticalHires} critical-role hire${volume.criticalHires !== 1 ? 's' : ''} (high business impact, tracked for faster closure and higher retention targets) vs ${volume.nonCriticalHires} non-critical hires supporting day-to-day operations.`,
    },
    {
      label: 'Offered-to-Join Ratio',
      text: `${joinedCount} of ${totalOffered} offered candidates have formally joined${futureCount > 0 ? `, with ${futureCount} having a future date-of-joining (counted in offers but excluded from the joined total until their DOJ arrives)` : ''}. Ratio = Joined ÷ Offered × 100.`,
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <ExplanationBanner title="Hiring Volume — Metric Guide" items={volExplanations} />
      {/* ── Monthly Hires Line Graph ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-400" />
              Hires per Month — Trend
            </CardTitle>
            {selectedMonths.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">Filter active:</span>
                {selectedMonths.map((m) => (
                  <Badge key={m} variant="violet" className="text-[10px]">{m}</Badge>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {allTimeVelocity.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={allTimeVelocity} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="hiresGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                <Tooltip content={<CustomLineTooltip />} />
                {/* Shaded area under the line */}
                <Area
                  type="monotone"
                  dataKey="count"
                  fill="url(#hiresGrad)"
                  stroke="transparent"
                  legendType="none"
                />
                {/* Main line */}
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Hires"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    const isHighlighted = selectedMonths.length === 0 || selectedMonths.includes(payload.month)
                    return (
                      <circle
                        key={payload.month}
                        cx={cx}
                        cy={cy}
                        r={isHighlighted ? 6 : 4}
                        fill={isHighlighted ? '#7c3aed' : 'hsl(217 33% 30%)'}
                        stroke={isHighlighted ? '#a78bfa' : 'transparent'}
                        strokeWidth={2}
                      />
                    )
                  }}
                  activeDot={{ r: 7, fill: '#a78bfa', stroke: '#7c3aed', strokeWidth: 2 }}
                />
                {/* Value labels above each point */}
                {allTimeVelocity.map((entry) => (
                  entry.count > 0 && (
                    <ReferenceDot
                      key={entry.month}
                      x={entry.month}
                      y={entry.count}
                      r={0}
                      label={{
                        value: entry.count,
                        position: 'top',
                        fill: selectedMonths.length === 0 || selectedMonths.includes(entry.month)
                          ? '#a78bfa'
                          : 'hsl(215 20% 45%)',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  )
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              No hire data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* MTD / QTD / YTD KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'MTD Hires', value: volume.mtd, sub: 'March 2026', color: 'violet' },
          { label: 'QTD Hires', value: volume.qtd, sub: 'Q1 2026', color: 'cyan' },
          { label: 'YTD Hires', value: volume.ytd, sub: 'Jan–Mar 2026', color: 'emerald' },
          { label: 'Open Positions', value: summary.openPositions, sub: `${summary.onHoldPositions} on hold`, color: 'amber' },
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hires by Department - Interactive */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <span>Hires by Department</span>
              <Badge variant="info" className="text-[10px]">Click to explore</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={volume.byDept}
                margin={{ left: 0, right: 10, bottom: 20 }}
                onClick={(d) => d?.activePayload && setSelectedDept(
                  selectedDept === d.activePayload[0]?.payload?.fullDept
                    ? null
                    : d.activePayload[0]?.payload?.fullDept
                )}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" />
                <XAxis
                  dataKey="dept"
                  tick={{ fill: 'hsl(215 20% 55%)', fontSize: 10 }}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Hires" radius={[4, 4, 0, 0]} cursor="pointer">
                  {volume.byDept.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.fullDept === selectedDept ? '#f59e0b' : COLORS[i % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Drill-down positions */}
            {selectedDept && (
              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" />
                  {selectedDept} — Positions Filled
                </p>
                <div className="space-y-1.5">
                  {deptPositions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No positions found</p>
                  ) : (
                    deptPositions.map((r, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="text-foreground">{r.role}</span>
                        <div className="flex gap-2">
                          {r.candidate && <span className="text-muted-foreground">{r.candidate}</span>}
                          {r.ctcOffered > 0 && (
                            <Badge variant="violet" className="text-[10px]">₹{r.ctcOffered}L</Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hires by Dept bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Hires by Month (Bar View)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={volume.velocityData.length ? volume.velocityData : allTimeVelocity} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Hires" radius={[4, 4, 0, 0]}>
                  {(volume.velocityData.length ? volume.velocityData : allTimeVelocity).map((entry, i) => (
                    <Cell
                      key={i}
                      fill={selectedMonths.length === 0 || selectedMonths.includes(entry.month) ? '#06b6d4' : 'hsl(217 33% 30%)'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Donut charts row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { title: 'Replacement vs New', data: replacementData },
          { title: 'Revenue vs Enabling', data: revenueData },
          { title: 'Critical vs Non-Critical', data: criticalData },
        ].map((chart, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {chart.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {chart.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={chart.data}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chart.data.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend
                      formatter={(value, entry) => (
                        <span className="text-xs text-muted-foreground">{value}: {entry.payload.value}</span>
                      )}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[160px] flex items-center justify-center text-muted-foreground text-xs">No data</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Offered to Join Ratio */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span className="text-muted-foreground uppercase tracking-wider text-xs">Offered to Join Ratio</span>
            <div className="flex gap-2">
              <Badge variant="success">{joinedCount} Joined</Badge>
              <Badge variant="info">{totalOffered} Offered</Badge>
              {futureCount > 0 && (
                <Badge variant="warning">{futureCount} Future DOJ</Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Offer Date</TableHead>
                  <TableHead>DOJ</TableHead>
                  <TableHead>CTC (₹L)</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offeredJoined.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-medium max-w-[150px] truncate">{r.role}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.dept}</TableCell>
                    <TableCell className="text-xs">{r.candidate}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.offerDate ? format(r.offerDate, 'dd MMM yyyy') : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.joinedDate ? format(r.joinedDate, 'dd MMM yyyy') : '—'}
                    </TableCell>
                    <TableCell className="text-xs">{r.ctc > 0 ? `₹${r.ctc}L` : '—'}</TableCell>
                    <TableCell>
                      {r.isFuture ? (
                        <Badge variant="warning" className="text-[10px]">Future DOJ*</Badge>
                      ) : r.joined ? (
                        <Badge variant="success" className="text-[10px]">Joined</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {futureCount > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              * Future DOJ rows are excluded from Offered-to-Join ratio calculation
            </p>
          )}
        </CardContent>
      </Card>

      {/* Headcount Plan March-April */}
      {volume.headcountPlan.length > 0 && (
        <Card className="metric-card-cyan">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-cyan-400" />
              <span className="text-muted-foreground uppercase tracking-wider text-xs">Headcount Plan — March / April 2026</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {volume.headcountPlan.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/40 border border-cyan-500/20">
                  <div>
                    <p className="text-sm font-medium">{r.role}</p>
                    <p className="text-xs text-muted-foreground">{r.dept} · {r.month}</p>
                    {r.candidate && r.candidate !== '—' && (
                      <p className="text-xs text-cyan-400 mt-0.5">Candidate: {r.candidate}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={
                      r.status === 'Joined' ? 'success' :
                      r.status === 'In Pipeline' ? 'info' :
                      r.status === 'Open' ? 'warning' : 'secondary'
                    } className="text-[10px]">
                      {r.status}
                    </Badge>
                    {r.ctc > 0 && <span className="text-xs text-cyan-400">₹{r.ctc}L</span>}
                  </div>
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
            Strategic Growth Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: '🚀',
                badge: 'Growth Rate',
                badgeVariant: 'violet',
                text: `Engineering leads with ${data.volume.byDept.find(d => d.fullDept?.includes('Engineering'))?.count || 0} hires — scaling velocity strong`,
              },
              {
                icon: '💼',
                badge: 'Mix Analysis',
                badgeVariant: 'info',
                text: `${volume.replacementCount} replacement vs ${volume.newPositionCount} new position hires — ${volume.newPositionCount > 0 ? 'positive growth signal' : 'backfill-heavy cycle'}`,
              },
              {
                icon: '📈',
                badge: 'Revenue Impact',
                badgeVariant: 'success',
                text: `${volume.revenueHires} revenue-generating vs ${volume.supportHires} enabling-function hires — revenue-first hiring strategy`,
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
