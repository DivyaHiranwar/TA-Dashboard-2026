import { AlertTriangle, Clock, CheckCircle, XCircle, Briefcase, Lightbulb } from 'lucide-react'
import { ExplanationBanner } from './ExplanationBanner'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'

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

function RiskScore({ score, label }) {
  const color = score >= 70 ? 'text-rose-400' : score >= 40 ? 'text-amber-400' : 'text-emerald-400'
  const barColor = score >= 70 ? 'bg-rose-500' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="text-center p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <div className="relative h-20 w-20 mx-auto mb-2">
        <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
          <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(217 33% 22%)" strokeWidth="8" />
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke={score >= 70 ? '#f43f5e' : score >= 40 ? '#f59e0b' : '#10b981'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 201} 201`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${color}`}>{score}</span>
        </div>
      </div>
      <p className={`text-xs font-medium ${color}`}>
        {score >= 70 ? '⚠ High Risk' : score >= 40 ? '⟳ Medium' : '✓ Low Risk'}
      </p>
    </div>
  )
}

export function PipelineHealth({ data, showExplanation = true }) {
  if (!data) return null
  const { pipeline, summary } = data

  const openByDeptData = Object.entries(pipeline.openByDept).map(([dept, count]) => ({
    dept: dept.length > 15 ? dept.slice(0, 15) + '…' : dept,
    count,
  }))

  const hiringRiskScore = Math.min(
    (pipeline.beyondSLACount * 30) +
    (pipeline.totalOnHold * 10) +
    (pipeline.totalOpen * 15),
    100
  )

  // Named lists for clarity
  const beyondSLARoles = pipeline.openPositions.filter(r => r.beyondSLA).map(r => r.role).join(', ')
  const onHoldRoles = pipeline.onHoldPositions.map(r => `${r.role} (${r.dept})`).join(', ')
  const pipelineCandidates = pipeline.pipelineRows.map(r => r.candidate && r.candidate !== '—' ? `${r.candidate} for ${r.role}` : r.role).join(', ')

  const pipelineExplanations = [
    {
      label: 'Open Positions',
      text: `${pipeline.totalOpen} active JDs where sourcing, interviews, or selection is ongoing. ${pipeline.totalOpen > 5 ? 'High count — prioritise closures to reduce business-impact from unfilled roles.' : 'Manageable pipeline — monitor ageing to avoid SLA breaches.'}`,
    },
    {
      label: 'On Hold',
      text: pipeline.totalOnHold > 0
        ? `${pipeline.totalOnHold} position${pipeline.totalOnHold !== 1 ? 's' : ''} temporarily paused${onHoldRoles ? `: ${onHoldRoles}` : ''}. Typically due to budget freeze, headcount reprioritisation, or hiring-manager change. Requires periodic reinstatement/closure review.`
        : 'No positions on hold — all active JDs are progressing through the pipeline.',
    },
    {
      label: 'Beyond SLA',
      text: pipeline.beyondSLACount > 0
        ? `${pipeline.beyondSLACount} position${pipeline.beyondSLACount !== 1 ? 's' : ''} have exceeded their agreed SLA deadline${beyondSLARoles ? `: ${beyondSLARoles}` : ''}. Requires immediate escalation — SLA breaches indicate process blockers or insufficient priority.`
        : 'All active positions are within their SLA timelines — excellent pipeline discipline and TA execution.',
    },
    {
      label: 'Offer Pipeline',
      text: pipeline.pipelineRows.length > 0
        ? `${pipeline.pipelineRows.length} candidate${pipeline.pipelineRows.length !== 1 ? 's' : ''} in the final offer/negotiation stage${pipelineCandidates ? `: ${pipelineCandidates}` : ''}. Expect these to convert to headcount additions in the near term.`
        : 'No candidates currently in the offer pipeline — accelerate selections from open-position interviews.',
    },
    {
      label: 'Hiring Risk Assessment',
      text: `Risk score combines: open positions (×15 each), on-hold positions (×10 each), and SLA breaches (×30 each), capped at 100. Lower is better. SLA Risk is critical — breaches indicate immediate delivery failures to hiring managers.`,
    },
    {
      label: 'Ageing Analysis',
      text: 'Shows how many days each open position has been active vs its SLA limit. Green = on track; amber = approaching SLA (>70% elapsed); red = SLA breached. Ageing beyond SLA requires escalation to the hiring manager.',
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {showExplanation && <ExplanationBanner title="Pipeline Health — Metric Guide" items={pipelineExplanations} />}
      {/* Pipeline KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Open Positions',
            value: pipeline.totalOpen,
            sub: 'Active JDs',
            color: 'rose',
            icon: Briefcase,
          },
          {
            label: 'On Hold',
            value: pipeline.totalOnHold,
            sub: 'Temporarily paused',
            color: 'amber',
            icon: Clock,
          },
          {
            label: 'Beyond SLA',
            value: pipeline.beyondSLACount,
            sub: 'Exceeded time limit',
            color: pipeline.beyondSLACount > 0 ? 'rose' : 'emerald',
            icon: AlertTriangle,
          },
          {
            label: 'Offer Pipeline',
            value: summary.pipelineCount,
            sub: 'Offers in progress',
            color: 'violet',
            icon: CheckCircle,
          },
        ].map((k, i) => (
          <Card key={i} className={`metric-card-${k.color}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{k.label}</p>
                <k.icon className={`h-4 w-4 text-${k.color}-400`} />
              </div>
              <p className={`text-3xl font-bold text-${k.color}-400`}>{k.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Risk Score + Open By Dept */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Risk Assessment */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Hiring Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <RiskScore
                score={hiringRiskScore}
                label="Overall Risk"
              />
              <RiskScore
                score={pipeline.beyondSLACount > 0 ? 75 : 15}
                label="SLA Risk"
              />
              <RiskScore
                score={pipeline.totalOnHold > 0 ? 45 : 10}
                label="Hold Risk"
              />
            </div>
            <div className="mt-4 space-y-2">
              {[
                {
                  label: 'Open Position Coverage',
                  value: pipeline.totalOpen,
                  max: 10,
                  color: 'bg-rose-500',
                },
                {
                  label: 'On-Hold Exposure',
                  value: pipeline.totalOnHold,
                  max: 10,
                  color: 'bg-amber-500',
                },
                {
                  label: 'SLA Breach Risk',
                  value: pipeline.beyondSLACount,
                  max: 5,
                  color: 'bg-rose-500',
                },
              ].map((r, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-medium">{r.value}</span>
                  </div>
                  <Progress
                    value={Math.min((r.value / r.max) * 100, 100)}
                    className="h-1.5"
                    indicatorClassName={r.color}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Open by Dept */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Open Positions by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            {openByDeptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={openByDeptData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 22%)" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }} />
                  <YAxis dataKey="dept" type="category" tick={{ fill: 'hsl(215 20% 65%)', fontSize: 10 }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Open" radius={[0, 4, 4, 0]} fill="#f43f5e" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                No open positions
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Open Positions Detail */}
      {pipeline.openPositions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              Open Positions — Ageing Analysis
              <Badge variant="danger">{pipeline.openPositions.length} open</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Hiring Manager</TableHead>
                  <TableHead>Criticality</TableHead>
                  <TableHead>Ageing (Days)</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pipeline.openPositions.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm font-medium">{r.role}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.dept}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.hiringManager || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={r.criticality === 'Critical' ? 'danger' : 'secondary'} className="text-[10px]">
                        {r.criticality || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-bold ${r.ageing > r.sla ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {r.ageing}d
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.sla}d</TableCell>
                    <TableCell>
                      {r.beyondSLA ? (
                        <Badge variant="danger" className="text-[10px] flex items-center gap-1 w-fit">
                          <XCircle className="h-3 w-3" /> SLA Breach
                        </Badge>
                      ) : r.ageing > r.sla * 0.7 ? (
                        <Badge variant="warning" className="text-[10px] flex items-center gap-1 w-fit">
                          <AlertTriangle className="h-3 w-3" /> Approaching
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-[10px] flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3" /> On Track
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* On Hold Positions */}
      {pipeline.onHoldPositions.length > 0 && (
        <Card className="metric-card-amber">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span className="text-muted-foreground uppercase tracking-wider text-xs">On Hold Positions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pipeline.onHoldPositions.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-background/40 border border-amber-500/20 flex justify-between">
                  <div>
                    <p className="text-sm font-medium">{r.role}</p>
                    <p className="text-xs text-muted-foreground">{r.dept}</p>
                    {r.hiringManager && <p className="text-xs text-amber-400 mt-0.5">HM: {r.hiringManager}</p>}
                  </div>
                  <Badge variant="warning" className="text-[10px] self-start">On Hold</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offer Pipeline */}
      {pipeline.pipelineRows.length > 0 && (
        <Card className="metric-card-violet">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-violet-400" />
              <span className="text-muted-foreground uppercase tracking-wider text-xs">Offer Pipeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pipeline.pipelineRows.map((r, i) => (
                <div key={i} className="p-3 rounded-lg bg-background/40 border border-violet-500/20 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{r.role}</p>
                    <p className="text-xs text-muted-foreground">{r.dept}</p>
                    {r.candidate && r.candidate !== '—' && (
                      <p className="text-xs text-violet-400 mt-0.5">Candidate: {r.candidate}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {r.ctc > 0 && <p className="text-sm font-bold text-violet-400">₹{r.ctc}L</p>}
                    {r.doj && (
                      <p className="text-xs text-muted-foreground">DOJ: {format(r.doj, 'dd MMM yyyy')}</p>
                    )}
                    {r.isFuture && (
                      <Badge variant="warning" className="text-[10px] mt-1">Future DOJ</Badge>
                    )}
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
            Pipeline Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: pipeline.totalOpen > 3 ? '🚨' : '✅',
                badge: 'Open Risk',
                badgeVariant: pipeline.totalOpen > 3 ? 'danger' : 'success',
                text: `${pipeline.totalOpen} open positions — ${pipeline.totalOpen > 3 ? 'high exposure, accelerate closures' : 'manageable pipeline'}`,
              },
              {
                icon: pipeline.beyondSLACount > 0 ? '⏰' : '✅',
                badge: 'SLA Breach',
                badgeVariant: pipeline.beyondSLACount > 0 ? 'danger' : 'success',
                text: `${pipeline.beyondSLACount} positions beyond SLA — ${pipeline.beyondSLACount > 0 ? 'immediate attention required' : 'all positions within SLA'}`,
              },
              {
                icon: '📋',
                badge: 'Forecast',
                badgeVariant: 'info',
                text: `${pipeline.pipelineRows.length} offer(s) in progress — expect ${pipeline.pipelineRows.length} addition to headcount soon`,
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
