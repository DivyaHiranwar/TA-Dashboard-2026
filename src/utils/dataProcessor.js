import { parseGvizDate, getMonthLabel, getQuarter, MONTHS } from '../lib/utils'

// Column indices (0-based)
const C = {
  ROLE: 0,
  HIRING_MANAGER: 1,
  DEPT: 2,
  OPEN: 3,
  ON_HOLD: 4,
  JOINED: 5,
  WIP: 6,
  MONTHLY: 7,
  QUARTERLY: 8,
  YEARLY: 9,
  CRITICALITY: 10,
  MODE: 11,
  REPLACEMENT_TYPE: 12,
  WHOSE_REPLACEMENT: 13,
  LAST_CTC: 14,
  CANDIDATE: 15,
  CTC_OFFERED: 16,
  MEDIAN_CTC: 17,
  COST_PER_HIRE: 18,
  AGENCY_SPEND: 19,
  REFERRAL_PAYOUT: 20,
  REVENUE_TYPE: 21,
  LOCATION: 22,
  START_DATE: 23,
  SLA_RESET: 24,
  SCREENED_DATE: 25,
  ON_HOLD_DATE: 26,
  AGEING_DAYS: 27,
  SLA: 28,
  JOINED_DATE: 29,
  SCREENING_DATE: 30,
  OFFER_DATE: 31,
  SIGNING_DATE: 32,
  TIME_TO_HIRE: 33,
  TIME_TO_FILL: 34,
  INTERVIEW_COUNT: 35,
  INTERVIEW_OFFER_RATE: 36,
  SLA_ADHERENCE: 37,
  SLA_MET: 38,
  EARLY_ATTRITION: 39,
  RETENTION_90: 40,
  HM_SATISFACTION: 41,
  CURRENT_STAGE: 42,
  L1: 43,
  L2: 44,
  L3: 45,
  FINAL_STAGE: 46,
  OFFER_PIPELINE: 47,
  OFFER_ACCEPTANCE: 48,
  COUNTER_OFFER: 49,
  OFFER_DROP_REASON: 50,
  COMMENTS: 51,
}

function getCell(row, idx) {
  if (!row || !row.c || idx >= row.c.length) return null
  const cell = row.c[idx]
  if (!cell) return null
  return cell.v !== undefined ? cell.v : null
}

function getNum(row, idx) {
  const v = getCell(row, idx)
  if (v === null || v === undefined) return 0
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

function getStr(row, idx) {
  const v = getCell(row, idx)
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function getDate(row, idx) {
  const v = getCell(row, idx)
  return parseGvizDate(v)
}

function toRow(gvizRow, cols) {
  const getValue = (idx) => {
    if (!gvizRow.c || idx >= gvizRow.c.length) return null
    const cell = gvizRow.c[idx]
    return cell ? cell.v : null
  }

  const role = (getValue(C.ROLE) || '').toString().trim()
  if (!role) return null

  const joined = getValue(C.JOINED)
  const openPos = getValue(C.OPEN)
  const onHold = getValue(C.ON_HOLD)
  const offerPipeline = getValue(C.OFFER_PIPELINE)
  const candidate = (getValue(C.CANDIDATE) || '').toString().trim()
  const startDate = parseGvizDate(getValue(C.START_DATE))
  const monthly = parseGvizDate(getValue(C.MONTHLY))

  // Filter: must have some activity
  const hasActivity =
    (joined && Number(joined) > 0) ||
    (openPos && Number(openPos) > 0) ||
    (onHold && Number(onHold) > 0) ||
    (offerPipeline && Number(offerPipeline) > 0) ||
    candidate ||
    startDate

  if (!hasActivity) return null

  const ctcOffered = Number(getValue(C.CTC_OFFERED)) || 0
  const agencySpend = Number(getValue(C.AGENCY_SPEND)) || 0
  const referralPayout = Number(getValue(C.REFERRAL_PAYOUT)) || 0
  const costPerHire = Number(getValue(C.COST_PER_HIRE)) || 0
  const timeToHire = Number(getValue(C.TIME_TO_HIRE)) || 0
  const timeToFill = Number(getValue(C.TIME_TO_FILL)) || 0
  const ageingDays = Number(getValue(C.AGEING_DAYS)) || 0
  const sla = Number(getValue(C.SLA)) || 60
  const retention90 = Number(getValue(C.RETENTION_90)) || 0
  const earlyAttrition = Number(getValue(C.EARLY_ATTRITION)) || 0
  const hmSatisfaction = getValue(C.HM_SATISFACTION)
  const interviewCount = Number(getValue(C.INTERVIEW_COUNT)) || 0
  const lastCTC = Number(getValue(C.LAST_CTC)) || 0
  const medianCTC = Number(getValue(C.MEDIAN_CTC)) || 0

  const joinedDate = parseGvizDate(getValue(C.JOINED_DATE))
  const offerDate = parseGvizDate(getValue(C.OFFER_DATE))
  const signingDate = parseGvizDate(getValue(C.SIGNING_DATE))
  const screenedDate = parseGvizDate(getValue(C.SCREENED_DATE))

  // Determine source
  let source = 'Direct'
  if (agencySpend > 0) source = 'Agency'
  else if (referralPayout > 0) source = 'Referral'

  const dept = (getValue(C.DEPT) || '').toString().trim()
  const replacementType = (getValue(C.REPLACEMENT_TYPE) || '').toString().trim()
  const revenueType = (getValue(C.REVENUE_TYPE) || '').toString().trim()
  const criticality = (getValue(C.CRITICALITY) || '').toString().trim()
  const slaAdherence = (getValue(C.SLA_ADHERENCE) || '').toString().trim()
  const slaMet = (getValue(C.SLA_MET) || '').toString().trim()
  const offerDropReason = (getValue(C.OFFER_DROP_REASON) || '').toString().trim()
  const currentStage = (getValue(C.CURRENT_STAGE) || '').toString().trim()
  const comments = (getValue(C.COMMENTS) || '').toString().trim()
  const location = (getValue(C.LOCATION) || '').toString().trim()
  const mode = (getValue(C.MODE) || '').toString().trim()
  const hiringManager = (getValue(C.HIRING_MANAGER) || '').toString().trim()

  return {
    role,
    hiringManager,
    dept: dept || 'Unknown',
    joined: Number(joined) || 0,
    openPos: Number(openPos) || 0,
    onHold: Number(onHold) || 0,
    offerPipeline: Number(offerPipeline) || 0,
    candidate,
    monthly,
    quarterly: (getValue(C.QUARTERLY) || '').toString().trim(),
    yearly: Number(getValue(C.YEARLY)) || null,
    ctcOffered,
    lastCTC,
    medianCTC,
    costPerHire,
    agencySpend,
    referralPayout,
    source,
    revenueType,
    criticality,
    replacementType,
    location,
    mode,
    startDate,
    joinedDate,
    offerDate,
    signingDate,
    screenedDate,
    ageingDays,
    sla,
    timeToHire: timeToHire > 0 && timeToHire < 1000 ? timeToHire : null,
    timeToFill: timeToFill > 0 && timeToFill < 1000 ? timeToFill : null,
    interviewCount,
    slaAdherence,
    slaMet,
    retention90,
    earlyAttrition,
    hmSatisfaction,
    offerDropReason,
    currentStage,
    comments,
  }
}

export function processSheetData(table) {
  const { cols, rows } = table
  const TODAY = new Date()

  // Parse all active rows
  const allRows = rows.map((r) => toRow(r, cols)).filter(Boolean)

  // Separate hires (joined > 0), open, on hold, pipeline
  const hires = allRows.filter((r) => r.joined > 0)
  const openPositions = allRows.filter((r) => r.openPos > 0)
  const onHoldPositions = allRows.filter((r) => r.onHold > 0)
  const pipelineRows = allRows.filter((r) => r.offerPipeline > 0)

  // Offered rows (have offer date or signing date)
  const offeredRows = allRows.filter((r) => r.offerDate || r.signingDate)

  // Joined (past DOJ)
  const joinedPast = hires.filter((r) => !r.joinedDate || r.joinedDate <= TODAY)
  const joinedFuture = hires.filter((r) => r.joinedDate && r.joinedDate > TODAY)

  // MTD / QTD / YTD
  const currentYear = 2026
  const currentMonth = 2 // March (0-indexed)
  const currentQuarter = 'Q1'

  const mtdHires = hires.filter(
    (r) => r.monthly && r.monthly.getFullYear() === currentYear && r.monthly.getMonth() === currentMonth
  )
  const qtdHires = hires.filter(
    (r) => r.monthly && r.monthly.getFullYear() === currentYear && getQuarter(r.monthly) === currentQuarter
  )
  const ytdHires = hires.filter((r) => r.monthly && r.monthly.getFullYear() === currentYear)

  // Hires by department
  const hiresByDept = {}
  for (const h of ytdHires) {
    const d = h.dept
    hiresByDept[d] = (hiresByDept[d] || 0) + h.joined
  }

  // Monthly hires
  const monthlyHires = {}
  for (const h of hires) {
    if (h.monthly) {
      const label = getMonthLabel(h.monthly)
      monthlyHires[label] = (monthlyHires[label] || 0) + h.joined
    }
  }

  // CTC by department
  const ctcByDept = {}
  const ctcCountByDept = {}
  for (const h of hires) {
    if (h.ctcOffered > 0) {
      const d = h.dept
      ctcByDept[d] = (ctcByDept[d] || 0) + h.ctcOffered
      ctcCountByDept[d] = (ctcCountByDept[d] || 0) + 1
    }
  }
  const avgCtcByDept = Object.keys(ctcByDept).reduce((acc, d) => {
    acc[d] = ctcByDept[d] / ctcCountByDept[d]
    return acc
  }, {})

  // Financial metrics
  const totalAgencySpend = allRows.reduce((s, r) => s + r.agencySpend, 0)
  const totalReferralPayout = allRows.reduce((s, r) => s + r.referralPayout, 0)
  const avgCostPerHire = ytdHires.length > 0
    ? ytdHires.reduce((s, r) => s + r.costPerHire, 0) / ytdHires.length
    : 0

  const totalCTCOffered = hires.reduce((s, r) => s + r.ctcOffered, 0)
  const avgCTC = hires.length > 0 ? totalCTCOffered / hires.length : 0

  // Time to hire metrics
  const tthValues = ytdHires.filter((r) => r.timeToHire && r.timeToHire > 0).map((r) => r.timeToHire)
  const avgTimeToHire = tthValues.length > 0 ? tthValues.reduce((a, b) => a + b, 0) / tthValues.length : 0

  const ttfValues = ytdHires.filter((r) => r.timeToFill && r.timeToFill > 0).map((r) => r.timeToFill)
  const avgTimeToFill = ttfValues.length > 0 ? ttfValues.reduce((a, b) => a + b, 0) / ttfValues.length : 0

  // SLA metrics
  const slaAdherent = ytdHires.filter((r) => r.slaAdherence === 'Yes').length
  const slaAdherenceRate = ytdHires.length > 0 ? (slaAdherent / ytdHires.length) * 100 : 0

  // Offer to join ratio
  const totalOffered = offeredRows.length
  const totalJoined = joinedPast.length
  const offerJoinRatio = totalOffered > 0 ? (totalJoined / totalOffered) * 100 : 0

  // Quality metrics
  const retentionValues = hires.filter((r) => r.retention90 > 0).map((r) => r.retention90)
  const avgRetention = retentionValues.length > 0 ? retentionValues.reduce((a, b) => a + b, 0) / retentionValues.length : 0

  const attritionValues = hires.filter((r) => r.earlyAttrition >= 0).map((r) => r.earlyAttrition)
  const avgAttrition = attritionValues.length > 0 ? attritionValues.reduce((a, b) => a + b, 0) / attritionValues.length : 0

  // Source breakdown
  const sourceBreakdown = { Agency: 0, Referral: 0, Direct: 0 }
  for (const h of ytdHires) {
    sourceBreakdown[h.source] = (sourceBreakdown[h.source] || 0) + h.joined
  }

  // Revenue vs Support
  const revenueHires = ytdHires.filter((r) => r.revenueType === 'Revenue').reduce((s, r) => s + r.joined, 0)
  const supportHires = ytdHires.filter((r) => r.revenueType !== 'Revenue' && r.revenueType).reduce((s, r) => s + r.joined, 0)

  // Replacement vs new
  const replacementHires = ytdHires.filter((r) => r.replacementType === 'Replacement').reduce((s, r) => s + r.joined, 0)
  const newPositionHires = ytdHires.filter((r) => r.replacementType === 'New position').reduce((s, r) => s + r.joined, 0)

  // Critical vs non-critical
  const criticalHires = ytdHires.filter((r) => r.criticality === 'Critical').reduce((s, r) => s + r.joined, 0)
  const nonCriticalHires = ytdHires.filter((r) => r.criticality === 'Non-critical').reduce((s, r) => s + r.joined, 0)

  // Pipeline health - positions beyond SLA
  const beyondSLA = openPositions.filter((r) => r.ageingDays > r.sla)
  const approachingSLA = openPositions.filter((r) => r.ageingDays > r.sla * 0.7 && r.ageingDays <= r.sla)

  // Hiring velocity by month
  const monthOrder = ['Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25', 'Jul-25', 'Aug-25', 'Sep-25', 'Oct-25', 'Nov-25', 'Dec-25',
    'Jan-26', 'Feb-26', 'Mar-26', 'Apr-26', 'May-26']
  const velocityData = Object.entries(monthlyHires)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month))

  // Time to hire by role (top roles)
  const tthByRole = ytdHires
    .filter((r) => r.timeToHire && r.timeToHire > 0)
    .map((r) => ({ role: r.role.length > 25 ? r.role.slice(0, 25) + '…' : r.role, days: r.timeToHire, dept: r.dept }))
    .sort((a, b) => b.days - a.days)

  // New joiners list
  const newJoiners = hires
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

  // Cost savings (direct vs agency)
  const directHireCost = 0 // direct hires have 0 agency spend
  const agencyHireCost = totalAgencySpend

  // Offer drop reasons
  const offerDrops = {}
  for (const r of allRows) {
    if (r.offerDropReason) {
      offerDrops[r.offerDropReason] = (offerDrops[r.offerDropReason] || 0) + 1
    }
  }

  // Interview to offer conversion
  const totalInterviews = ytdHires.reduce((s, r) => s + r.interviewCount, 0)
  const interviewOfferRate = totalInterviews > 0 ? (ytdHires.length / totalInterviews) * 100 : 0

  // Headcount plan (upcoming March, April)
  const headcountPlan = allRows.filter(
    (r) =>
      r.monthly &&
      r.monthly.getFullYear() === currentYear &&
      (r.monthly.getMonth() === 2 || r.monthly.getMonth() === 3) // March or April
  )

  // Open positions by dept
  const openByDept = {}
  for (const r of openPositions) {
    openByDept[r.dept] = (openByDept[r.dept] || 0) + r.openPos
  }

  // Dept hires bar chart data
  const deptChartData = Object.entries(hiresByDept)
    .map(([dept, count]) => ({
      dept: dept.length > 18 ? dept.slice(0, 18) + '…' : dept,
      fullDept: dept,
      count,
      avgCTC: avgCtcByDept[dept] || 0,
    }))
    .sort((a, b) => b.count - a.count)

  // CTC by dept chart data
  const ctcChartData = Object.entries(avgCtcByDept)
    .map(([dept, avg]) => ({
      dept: dept.length > 18 ? dept.slice(0, 18) + '…' : dept,
      avgCTC: parseFloat(avg.toFixed(2)),
      count: ctcCountByDept[dept] || 0,
    }))
    .sort((a, b) => b.avgCTC - a.avgCTC)

  // Month-wise CTC trend
  const ctcByMonth = {}
  for (const h of hires) {
    if (h.monthly && h.ctcOffered > 0) {
      const label = getMonthLabel(h.monthly)
      if (!ctcByMonth[label]) ctcByMonth[label] = { total: 0, count: 0 }
      ctcByMonth[label].total += h.ctcOffered
      ctcByMonth[label].count += 1
    }
  }
  const ctcTrendData = Object.entries(ctcByMonth)
    .map(([month, d]) => ({ month, avgCTC: parseFloat((d.total / d.count).toFixed(2)), count: d.count }))
    .sort((a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month))

  return {
    summary: {
      totalHiresMTD: mtdHires.reduce((s, r) => s + r.joined, 0),
      totalHiresQTD: qtdHires.reduce((s, r) => s + r.joined, 0),
      totalHiresYTD: ytdHires.reduce((s, r) => s + r.joined, 0),
      totalHiresAllTime: hires.reduce((s, r) => s + r.joined, 0),
      avgCostPerHire,
      avgTimeToHire: parseFloat(avgTimeToHire.toFixed(1)),
      avgTimeToFill: parseFloat(avgTimeToFill.toFixed(1)),
      slaAdherenceRate: parseFloat(slaAdherenceRate.toFixed(1)),
      offerJoinRatio: parseFloat(offerJoinRatio.toFixed(1)),
      totalOffered,
      totalJoined: joinedPast.length,
      joinedFuture: joinedFuture.length,
      openPositions: openPositions.reduce((s, r) => s + r.openPos, 0),
      onHoldPositions: onHoldPositions.reduce((s, r) => s + r.onHold, 0),
      pipelineCount: pipelineRows.length,
    },
    financial: {
      totalAgencySpend,
      totalReferralPayout,
      avgCostPerHire,
      avgCTC,
      totalCTCOffered,
      ctcByDept: ctcChartData,
      internalCost: 0,
      externalCost: totalAgencySpend,
      costSavingsDirect: totalAgencySpend > 0 ? 0 : null,
      hiresBySource: sourceBreakdown,
    },
    volume: {
      mtd: mtdHires.reduce((s, r) => s + r.joined, 0),
      qtd: qtdHires.reduce((s, r) => s + r.joined, 0),
      ytd: ytdHires.reduce((s, r) => s + r.joined, 0),
      byDept: deptChartData,
      replacementCount: replacementHires,
      newPositionCount: newPositionHires,
      revenueHires,
      supportHires,
      criticalHires,
      nonCriticalHires,
      velocityData,
      headcountPlan: headcountPlan.map((r) => ({
        role: r.role,
        dept: r.dept,
        month: r.monthly ? getMonthLabel(r.monthly) : '—',
        status: r.joined > 0 ? 'Joined' : r.offerPipeline > 0 ? 'In Pipeline' : r.openPos > 0 ? 'Open' : 'Planned',
        candidate: r.candidate || '—',
        ctc: r.ctcOffered,
        doj: r.joinedDate,
      })),
      offeredRows: offeredRows.map((r) => ({
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
      newJoiners,
      avgCTC,
      ctcTrendData,
      ctcByDept: ctcChartData,
      offerDrops,
      offerJoinRatio: parseFloat(offerJoinRatio.toFixed(1)),
      maxCTC: Math.max(...hires.map((r) => r.ctcOffered).filter((v) => v > 0), 0),
      minCTC: Math.min(...hires.map((r) => r.ctcOffered).filter((v) => v > 0), Infinity),
    },
    speed: {
      avgTimeToHire: parseFloat(avgTimeToHire.toFixed(1)),
      avgTimeToFill: parseFloat(avgTimeToFill.toFixed(1)),
      slaAdherenceRate: parseFloat(slaAdherenceRate.toFixed(1)),
      velocityData,
      tthByRole: tthByRole.slice(0, 10),
      slaMetBreakdown: {
        onTrack: ytdHires.filter((r) => r.slaMet === 'On Track').length,
        above60: ytdHires.filter((r) => r.slaMet === 'Above 60').length,
        above100: ytdHires.filter((r) => r.slaMet === 'Above 100').length,
      },
      hiringVelocity: velocityData,
    },
    quality: {
      avgRetention: parseFloat(avgRetention.toFixed(1)),
      avgAttrition: parseFloat(avgAttrition.toFixed(1)),
      retentionByDept: Object.entries(
        hires.reduce((acc, r) => {
          if (r.retention90 > 0) {
            if (!acc[r.dept]) acc[r.dept] = { total: 0, count: 0 }
            acc[r.dept].total += r.retention90
            acc[r.dept].count += 1
          }
          return acc
        }, {})
      ).map(([dept, d]) => ({
        dept: dept.length > 18 ? dept.slice(0, 18) + '…' : dept,
        retention: parseFloat((d.total / d.count).toFixed(1)),
      })),
      sourceQuality: Object.entries(
        hires.reduce((acc, r) => {
          if (!acc[r.source]) acc[r.source] = { retention: 0, count: 0, attrition: 0 }
          if (r.retention90 > 0) {
            acc[r.source].retention += r.retention90
            acc[r.source].count += 1
          }
          acc[r.source].attrition += r.earlyAttrition
          return acc
        }, {})
      ).map(([source, d]) => ({
        source,
        avgRetention: d.count > 0 ? parseFloat((d.retention / d.count).toFixed(1)) : 0,
        avgAttrition: parseFloat(d.attrition.toFixed(1)),
      })),
      criticalHireRetention:
        hires.filter((r) => r.criticality === 'Critical' && r.retention90 > 0).reduce((s, r) => s + r.retention90, 0) /
          (hires.filter((r) => r.criticality === 'Critical' && r.retention90 > 0).length || 1) || 0,
    },
    source: {
      breakdown: sourceBreakdown,
      hiresBySource: Object.entries(sourceBreakdown).map(([source, count]) => ({
        source,
        count,
        pct: ytdHires.length > 0 ? parseFloat(((count / ytdHires.reduce((s, r) => s + r.joined, 0)) * 100).toFixed(1)) : 0,
      })),
      costBySource: {
        Agency: totalAgencySpend,
        Referral: totalReferralPayout,
        Direct: 0,
      },
      referralSuccess: ytdHires.filter((r) => r.source === 'Referral').reduce((s, r) => s + r.joined, 0),
      totalReferralSpend: totalReferralPayout,
    },
    pipeline: {
      openPositions: openPositions.map((r) => ({
        role: r.role,
        dept: r.dept,
        ageing: r.ageingDays,
        sla: r.sla,
        beyondSLA: r.ageingDays > r.sla,
        hiringManager: r.hiringManager,
        criticality: r.criticality,
      })),
      onHoldPositions: onHoldPositions.map((r) => ({
        role: r.role,
        dept: r.dept,
        reason: r.currentStage || '—',
        hiringManager: r.hiringManager,
      })),
      pipelineRows: pipelineRows.map((r) => ({
        role: r.role,
        dept: r.dept,
        candidate: r.candidate || '—',
        doj: r.joinedDate,
        isFuture: r.joinedDate && r.joinedDate > TODAY,
        ctc: r.ctcOffered,
      })),
      beyondSLACount: beyondSLA.length,
      approachingSLACount: approachingSLA.length,
      openByDept,
      totalOpen: openPositions.reduce((s, r) => s + r.openPos, 0),
      totalOnHold: onHoldPositions.reduce((s, r) => s + r.onHold, 0),
    },
    rawRows: allRows,
  }
}
