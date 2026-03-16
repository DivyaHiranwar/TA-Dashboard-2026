import { useState, useMemo } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/dashboard/Header'
import { TopSummary } from '@/components/dashboard/TopSummary'
import { FinancialImpact } from '@/components/dashboard/FinancialImpact'
import { HiringVolume } from '@/components/dashboard/HiringVolume'
import { CompensationTrends } from '@/components/dashboard/CompensationTrends'
import { HiringSpeed } from '@/components/dashboard/HiringSpeed'
import { QualityOfHire } from '@/components/dashboard/QualityOfHire'
import { SourceROI } from '@/components/dashboard/SourceROI'
import { PipelineHealth } from '@/components/dashboard/PipelineHealth'
import { useSheetData } from '@/hooks/useSheetData'
import { filterDataByMonths, getAvailableMonths } from '@/utils/filterData'
import { generateReport } from '@/utils/generateReport'
import {
  DollarSign, Users, TrendingUp, Zap, Award, GitBranch,
  Activity, LayoutDashboard, AlertCircle, RefreshCw, Filter, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const TABS = [
  { id: 'financial',    label: 'Financial Impact',  icon: DollarSign, color: 'text-violet-400' },
  { id: 'volume',       label: 'Hiring Volume',      icon: Users,      color: 'text-cyan-400' },
  { id: 'compensation', label: 'Compensation',       icon: TrendingUp, color: 'text-emerald-400' },
  { id: 'speed',        label: 'Speed & SLA',        icon: Zap,        color: 'text-amber-400' },
  { id: 'quality',      label: 'Quality of Hire',    icon: Award,      color: 'text-rose-400' },
  { id: 'source',       label: 'Source ROI',         icon: GitBranch,  color: 'text-sky-400' },
  { id: 'pipeline',      label: 'Pipeline Health',   icon: Activity,        color: 'text-indigo-400' },
  { id: 'pipeline-view', label: 'Pipeline View',    icon: LayoutDashboard, color: 'text-teal-400' },
]

const MONTH_LABELS = {
  'Jan-26': 'Jan 2026',
  'Feb-26': 'Feb 2026',
  'Mar-26': 'Mar 2026',
  'Apr-26': 'Apr 2026',
  'May-26': 'May 2026',
  'Jun-26': 'Jun 2026',
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-border" />
        <div className="absolute inset-0 rounded-full border-4 border-t-violet-500 border-r-cyan-500 border-b-transparent border-l-transparent animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Loading live data from Google Sheets…</p>
        <p className="text-xs text-muted-foreground mt-1">Fetching and processing recruitment data</p>
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20">
        <AlertCircle className="h-10 w-10 text-rose-400" />
      </div>
      <div className="text-center max-w-md">
        <p className="text-base font-semibold text-foreground">Failed to Load Data</p>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Please ensure the Google Sheets document is publicly accessible and try again.
        </p>
      </div>
      <Button variant="gradient" onClick={onRetry} className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  )
}

function MonthFilterBar({ availableMonths, selectedMonths, onChange, filteredCount, totalCount }) {
  const isFiltered = selectedMonths.length > 0

  function toggle(month) {
    onChange(
      selectedMonths.includes(month)
        ? selectedMonths.filter((m) => m !== month)
        : [...selectedMonths, month]
    )
  }

  return (
    <div className="px-6 py-2.5 border-b border-border/50 bg-muted/20 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium flex-shrink-0">
        <Filter className="h-3.5 w-3.5" />
        Filter by Month:
      </div>

      <div className="flex flex-wrap gap-2">
        {availableMonths.map((month) => {
          const active = selectedMonths.includes(month)
          return (
            <button
              key={month}
              onClick={() => toggle(month)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                border transition-all duration-150 select-none cursor-pointer
                ${active
                  ? 'bg-violet-600 border-violet-500 text-white shadow-sm shadow-violet-500/30'
                  : 'bg-muted/50 border-border text-muted-foreground hover:border-violet-500/50 hover:text-violet-300'
                }
              `}
            >
              <span
                className={`h-2.5 w-2.5 rounded-sm border flex-shrink-0 flex items-center justify-center transition-colors
                  ${active ? 'bg-white border-white' : 'border-current'}`}
              >
                {active && (
                  <svg viewBox="0 0 8 8" className="h-2 w-2" fill="none">
                    <path d="M1.5 4L3 5.5L6.5 2.5" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {MONTH_LABELS[month] || month}
            </button>
          )
        })}
      </div>

      {isFiltered ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-px bg-border hidden sm:block" />
          <Badge variant="violet" className="text-[10px] py-0.5">
            {filteredCount} hire{filteredCount !== 1 ? 's' : ''} shown
          </Badge>
          <span className="text-xs text-muted-foreground">of {totalCount} total</span>
          <button
            onClick={() => onChange([])}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-400 transition-colors ml-1"
          >
            <X className="h-3 w-3" />
            Reset
          </button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground italic">All months · {totalCount} total hires</span>
      )}
    </div>
  )
}

export default function App() {
  const { data: baseData, loading, error, refresh, lastRefresh } = useSheetData()
  const [activeTab, setActiveTab] = useState('financial')
  const [selectedMonths, setSelectedMonths] = useState([])
  const [exporting, setExporting] = useState(false)

  function handleExport() {
    if (!baseData) return
    setExporting(true)
    setTimeout(() => {
      try { generateReport(baseData) } catch (e) { console.error('PDF generation failed', e) }
      setExporting(false)
    }, 50)
  }

  const availableMonths = useMemo(
    () => (baseData ? getAvailableMonths(baseData) : []),
    [baseData]
  )

  const data = useMemo(
    () => (baseData ? filterDataByMonths(baseData, selectedMonths) : null),
    [baseData, selectedMonths]
  )

  const totalCount = baseData?.summary?.totalHiresYTD ?? 0
  const filteredCount = data?.summary?.totalHiresYTD ?? 0

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-background">
        <Header onRefresh={refresh} loading={loading} lastRefresh={lastRefresh} error={error} onExport={handleExport} exporting={exporting} />

        {!loading && !error && data && <TopSummary data={data} />}

        {!loading && !error && baseData && availableMonths.length > 0 && (
          <MonthFilterBar
            availableMonths={availableMonths}
            selectedMonths={selectedMonths}
            onChange={setSelectedMonths}
            filteredCount={filteredCount}
            totalCount={totalCount}
          />
        )}

        <main className="px-6 py-5">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={refresh} />
          ) : data ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="overflow-x-auto pb-1">
                <TabsList className="h-auto p-1.5 gap-1 w-full sm:w-auto flex">
                  {TABS.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap
                        data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600/20 data-[state=active]:to-cyan-600/10
                        data-[state=active]:border-b-2 data-[state=active]:border-violet-500
                        rounded-md transition-all"
                    >
                      <tab.icon className={`h-3.5 w-3.5 ${activeTab === tab.id ? tab.color : 'text-muted-foreground'}`} />
                      <span className={activeTab === tab.id ? tab.color : ''}>{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="financial">
                <FinancialImpact data={data} />
              </TabsContent>
              <TabsContent value="volume">
                {/* pass fullData so the all-time line chart always shows every month */}
                <HiringVolume data={data} fullData={baseData} selectedMonths={selectedMonths} />
              </TabsContent>
              <TabsContent value="compensation">
                <CompensationTrends data={data} />
              </TabsContent>
              <TabsContent value="speed">
                <HiringSpeed data={data} />
              </TabsContent>
              <TabsContent value="quality">
                <QualityOfHire data={data} />
              </TabsContent>
              <TabsContent value="source">
                <SourceROI data={data} />
              </TabsContent>
              <TabsContent value="pipeline">
                <PipelineHealth data={data} />
              </TabsContent>
              <TabsContent value="pipeline-view">
                <PipelineHealth data={data} showExplanation={false} />
              </TabsContent>
            </Tabs>
          ) : null}
        </main>

        <footer className="border-t border-border/50 px-6 py-3 mt-8">
          <p className="text-xs text-muted-foreground text-center">
            iMocha Talent Acquisition Dashboard 2026 · Live data from Google Sheets ·
            Auto-refresh: Manual · Data source: Recruitment Tracker
          </p>
        </footer>
      </div>
    </TooltipProvider>
  )
}
