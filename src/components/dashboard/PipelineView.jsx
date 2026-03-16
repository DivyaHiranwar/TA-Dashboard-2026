import { AlertTriangle, Clock, CheckCircle, XCircle, Briefcase, Zap, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'

export function PipelineView({ data }) {
  if (!data) return null
  const { pipeline, summary } = data

  const metrics = [
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
      sub: 'Paused roles',
      color: 'amber',
      icon: Clock,
    },
    {
      label: 'Offer Pipeline',
      value: summary.pipelineCount,
      sub: 'Offers in progress',
      color: 'violet',
      icon: CheckCircle,
    },
    {
      label: 'Total Hires YTD',
      value: summary.totalHiresYTD,
      sub: `MTD: ${summary.totalHiresMTD} · QTD: ${summary.totalHiresQTD}`,
      color: 'cyan',
      icon: Users,
    },
    {
      label: 'Avg Time to Fill',
      value: summary.avgTimeToFill ? `${summary.avgTimeToFill}d` : '—',
      sub: 'JD open → Offer release',
      color: 'emerald',
      icon: Zap,
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">

      {/* 5 KPIs in one row */}
      <div className="grid grid-cols-5 gap-4">
        {metrics.map((k, i) => (
          <Card key={i} className={`metric-card-${k.color}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider leading-tight">{k.label}</p>
                <k.icon className={`h-4 w-4 text-${k.color}-400 flex-shrink-0`} />
              </div>
              <p className={`text-3xl font-bold text-${k.color}-400`}>{k.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Open Positions Ageing Table */}
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

      {/* On Hold + Offer Pipeline side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* On Hold */}
        {pipeline.onHoldPositions.length > 0 ? (
          <Card className="metric-card-amber">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" />
                <span className="text-muted-foreground uppercase tracking-wider text-xs">On Hold Positions</span>
                <Badge variant="warning" className="ml-auto text-[10px]">{pipeline.onHoldPositions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
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
        ) : (
          <Card className="metric-card-emerald">
            <CardContent className="p-6 flex items-center justify-center text-emerald-400 text-sm font-medium">
              ✓ No positions on hold
            </CardContent>
          </Card>
        )}

        {/* Offer Pipeline */}
        {pipeline.pipelineRows.length > 0 ? (
          <Card className="metric-card-violet">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-violet-400" />
                <span className="text-muted-foreground uppercase tracking-wider text-xs">Offer Pipeline</span>
                <Badge variant="violet" className="ml-auto text-[10px]">{pipeline.pipelineRows.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
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
        ) : (
          <Card className="metric-card-violet">
            <CardContent className="p-6 flex items-center justify-center text-muted-foreground text-sm">
              No active offer pipeline
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  )
}
