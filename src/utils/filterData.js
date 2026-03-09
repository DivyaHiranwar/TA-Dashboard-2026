import { getMonthLabel } from '@/lib/utils'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_ORDER = [
  'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25',
  'Jul-25', 'Aug-25', 'Sep-25', 'Oct-25', 'Nov-25', 'Dec-25',
  'Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26', 'Jun-26',
]

function parseMonthFilter(monthStr) {
  const [mon, yr] = monthStr.split('-')
  return { month: MONTH_NAMES.indexOf(mon), year: 2000 + parseInt(yr, 10) }
}

function matchesFilter(date, filters) {
  if (!date) return false
  return filters.some((f) => date.getMonth() === f.month && date.getFullYear() === f.year)
}

/** Returns all unique month labels (e.g. 'Jan-26') that have at least one joined hire */
export function getAvailableMonths(baseData) {
  return baseData.volume.velocityData.map((d) => d.month)
}

/**
 * Returns a new data object filtered to the selected months.
 * When selectedMonths is empty/null returns baseData unchanged.
 */
export function filterDataByMonths(baseData, selectedMonths) {
  if (!selectedMonths || selectedMonths.length === 0) return baseData

  const TODAY = new Date()
  const filters = selectedMonths.map(parseMonthFilter)
  const { rawRows } = baseData

  // Hired rows that belong to the selected months
  const filteredHires = rawRows.filter(
    (r) => r.joined > 0 && r.monthly && matchesFilter(r.monthly, filters)
  )

  // Offered rows whose monthly date falls in the selected months
  const filteredOffered = rawRows.filter(
    (r) => (r.offerDate || r.signingDate) && r.monthly && matchesFilter(r.monthly, filters)
  )

  const totalHires = filteredHires.reduce((s, r) => s + r.joined, 0)
  const totalJoined = filteredHires.filter((r) => !r.joinedDate || r.joinedDate <= TODAY).length
  const totalOffered = filteredOffered.length
  const offerJoinRatio = totalOffered > 0 ? (totalJoined / totalOffered) * 100 : 0

  // ── Dept breakdown ───────────────────────────────────────────────────────────
  const hiresByDept = {}
  const ctcByDept = {}
  const ctcCountByDept = {}
  for (const h of filteredHires) {
    hiresByDept[h.dept] = (hiresByDept[h.dept] || 0) + h.joined
    if (h.ctcOffered > 0) {
      ctcByDept[h.dept] = (ctcByDept[h.dept] || 0) + h.ctcOffered
      ctcCountByDept[h.dept] = (ctcCountByDept[h.dept] || 0) + 1
    }
  }
  const avgCtcByDept = Object.fromEntries(
    Object.keys(ctcByDept).map((d) => [d, ctcByDept[d] / ctcCountByDept[d]])
  )
  const ctcChartData = Object.entries(avgCtcByDept)
    .map(([dept, avg]) => ({
      dept: dept.length > 18 ? dept.slice(0, 18) + '…' : dept,
      avgCTC: parseFloat(avg.toFixed(2)),
      count: ctcCountByDept[dept] || 0,
    }))
    .sort((a, b) => b.avgCTC - a.avgCTC)

  const deptChartData = Object.entries(hiresByDept)
    .map(([dept, count]) => ({
      dept: dept.length > 18 ? dept.slice(0, 18) + '…' : dept,
      fullDept: dept,
      count,
      avgCTC: avgCtcByDept[dept] || 0,
    }))
    .sort((a, b) => b.count - a.count)

  // ── Financial ────────────────────────────────────────────────────────────────
  const totalCTCOffered = filteredHires.reduce((s, r) => s + r.ctcOffered, 0)
  const avgCTC = filteredHires.length > 0 ? totalCTCOffered / filteredHires.length : 0
  const totalAgencySpend = filteredHires.reduce((s, r) => s + r.agencySpend, 0)
  const totalReferralPayout = filteredHires.reduce((s, r) => s + r.referralPayout, 0)

  // ── Speed ────────────────────────────────────────────────────────────────────
  const tthValues = filteredHires.filter((r) => r.timeToHire > 0).map((r) => r.timeToHire)
  const avgTimeToHire = tthValues.length > 0 ? tthValues.reduce((a, b) => a + b, 0) / tthValues.length : 0
  const ttfValues = filteredHires.filter((r) => r.timeToFill > 0).map((r) => r.timeToFill)
  const avgTimeToFill = ttfValues.length > 0 ? ttfValues.reduce((a, b) => a + b, 0) / ttfValues.length : 0
  const slaAdherent = filteredHires.filter((r) => r.slaAdherence === 'Yes').length
  const slaAdherenceRate = filteredHires.length > 0 ? (slaAdherent / filteredHires.length) * 100 : 0
  const tthByRole = filteredHires
    .filter((r) => r.timeToHire > 0)
    .map((r) => ({ role: r.role.length > 25 ? r.role.slice(0, 25) + '…' : r.role, days: r.timeToHire, dept: r.dept }))
    .sort((a, b) => b.days - a.days)
  const slaMetBreakdown = {
    onTrack: filteredHires.filter((r) => r.slaMet === 'On Track').length,
    above60: filteredHires.filter((r) => r.slaMet === 'Above 60').length,
    above100: filteredHires.filter((r) => r.slaMet === 'Above 100').length,
  }

  // ── Velocity (only selected months) ─────────────────────────────────────────
  const monthlyHires = {}
  for (const h of filteredHires) {
    if (h.monthly) {
      const label = getMonthLabel(h.monthly)
      monthlyHires[label] = (monthlyHires[label] || 0) + h.joined
    }
  }
  const velocityData = Object.entries(monthlyHires)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month))

  // ── Mix breakdown ────────────────────────────────────────────────────────────
  const replacementCount = filteredHires.filter((r) => r.replacementType === 'Replacement').reduce((s, r) => s + r.joined, 0)
  const newPositionCount = filteredHires.filter((r) => r.replacementType === 'New position').reduce((s, r) => s + r.joined, 0)
  const revenueHires = filteredHires.filter((r) => r.revenueType === 'Revenue').reduce((s, r) => s + r.joined, 0)
  const supportHires = filteredHires.filter((r) => r.revenueType !== 'Revenue' && r.revenueType).reduce((s, r) => s + r.joined, 0)
  const criticalHires = filteredHires.filter((r) => r.criticality === 'Critical').reduce((s, r) => s + r.joined, 0)
  const nonCriticalHires = filteredHires.filter((r) => r.criticality === 'Non-critical').reduce((s, r) => s + r.joined, 0)

  // ── Source ───────────────────────────────────────────────────────────────────
  const sourceBreakdown = { Agency: 0, Referral: 0, Direct: 0 }
  for (const h of filteredHires) {
    sourceBreakdown[h.source] = (sourceBreakdown[h.source] || 0) + h.joined
  }

  // ── Quality ──────────────────────────────────────────────────────────────────
  const retValues = filteredHires.filter((r) => r.retention90 > 0).map((r) => r.retention90)
  const avgRetention = retValues.length > 0 ? retValues.reduce((a, b) => a + b, 0) / retValues.length : 0
  const attrValues = filteredHires.map((r) => r.earlyAttrition)
  const avgAttrition = attrValues.length > 0 ? attrValues.reduce((a, b) => a + b, 0) / attrValues.length : 0

  const retByDept = {}
  const retCountByDept = {}
  for (const h of filteredHires) {
    if (h.retention90 > 0) {
      retByDept[h.dept] = (retByDept[h.dept] || 0) + h.retention90
      retCountByDept[h.dept] = (retCountByDept[h.dept] || 0) + 1
    }
  }
  const retentionByDept = Object.entries(retByDept).map(([dept, total]) => ({
    dept: dept.length > 18 ? dept.slice(0, 18) + '…' : dept,
    retention: parseFloat((total / retCountByDept[dept]).toFixed(1)),
  }))

  // ── New joiners list ─────────────────────────────────────────────────────────
  const newJoiners = filteredHires
    .filter((r) => r.candidate && r.ctcOffered > 0)
    .map((r) => ({
      candidate: r.candidate,
      role: r.role,
      dept: r.dept,
      ctc: r.ctcOffered,
      doj: r.joinedDate,
      month: r.monthly ? getMonthLabel(r.monthly) : '—',
      source: r.source,
      isFuture: r.joinedDate && r.joinedDate > TODAY,
    }))

  // ── CTC trend (filtered months) ──────────────────────────────────────────────
  const ctcTrendMap = {}
  for (const h of filteredHires) {
    if (h.monthly && h.ctcOffered > 0) {
      const label = getMonthLabel(h.monthly)
      if (!ctcTrendMap[label]) ctcTrendMap[label] = { total: 0, count: 0 }
      ctcTrendMap[label].total += h.ctcOffered
      ctcTrendMap[label].count += 1
    }
  }
  const ctcTrendData = Object.entries(ctcTrendMap)
    .map(([month, d]) => ({ month, avgCTC: parseFloat((d.total / d.count).toFixed(2)), count: d.count }))
    .sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month))

  // ── Assemble filtered data ────────────────────────────────────────────────────
  return {
    ...baseData,
    summary: {
      ...baseData.summary,
      totalHiresYTD: totalHires,
      totalHiresMTD: filteredHires.filter((r) => r.monthly?.getMonth() === 2).reduce((s, r) => s + r.joined, 0),
      totalHiresQTD: totalHires,
      totalJoined,
      totalOffered,
      offerJoinRatio: parseFloat(offerJoinRatio.toFixed(1)),
      avgTimeToHire: parseFloat(avgTimeToHire.toFixed(1)),
      avgTimeToFill: parseFloat(avgTimeToFill.toFixed(1)),
      slaAdherenceRate: parseFloat(slaAdherenceRate.toFixed(1)),
    },
    financial: {
      ...baseData.financial,
      totalAgencySpend,
      totalReferralPayout,
      totalCTCOffered,
      avgCTC,
      ctcByDept: ctcChartData,
      hiresBySource: sourceBreakdown,
    },
    volume: {
      ...baseData.volume,
      mtd: filteredHires.filter((r) => r.monthly?.getMonth() === 2).reduce((s, r) => s + r.joined, 0),
      qtd: totalHires,
      ytd: totalHires,
      byDept: deptChartData,
      replacementCount,
      newPositionCount,
      revenueHires,
      supportHires,
      criticalHires,
      nonCriticalHires,
      velocityData,
      offeredRows: filteredOffered.map((r) => ({
        role: r.role,
        dept: r.dept,
        candidate: r.candidate || '—',
        offerDate: r.offerDate,
        joinedDate: r.joinedDate,
        ctc: r.ctcOffered,
        isFuture: r.joinedDate && r.joinedDate > TODAY,
        joined: r.joined > 0,
      })),
    },
    compensation: {
      ...baseData.compensation,
      newJoiners,
      avgCTC,
      ctcByDept: ctcChartData,
      ctcTrendData,
      maxCTC: Math.max(...filteredHires.map((r) => r.ctcOffered).filter((v) => v > 0), 0),
      minCTC: Math.min(...filteredHires.map((r) => r.ctcOffered).filter((v) => v > 0), Infinity),
    },
    speed: {
      ...baseData.speed,
      avgTimeToHire: parseFloat(avgTimeToHire.toFixed(1)),
      avgTimeToFill: parseFloat(avgTimeToFill.toFixed(1)),
      slaAdherenceRate: parseFloat(slaAdherenceRate.toFixed(1)),
      tthByRole,
      slaMetBreakdown,
      hiringVelocity: velocityData,
    },
    quality: {
      ...baseData.quality,
      avgRetention: parseFloat(avgRetention.toFixed(1)),
      avgAttrition: parseFloat(avgAttrition.toFixed(1)),
      retentionByDept,
    },
    source: {
      ...baseData.source,
      breakdown: sourceBreakdown,
      hiresBySource: Object.entries(sourceBreakdown).map(([source, count]) => ({
        source,
        count,
        pct: totalHires > 0 ? parseFloat(((count / totalHires) * 100).toFixed(1)) : 0,
      })),
    },
    // keep pipeline & rawRows always from base (pipeline is not month-filtered)
    pipeline: baseData.pipeline,
    rawRows: baseData.rawRows,
  }
}
