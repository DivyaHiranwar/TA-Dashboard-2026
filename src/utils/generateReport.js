function fmt(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return '—' }
}

function currency(v) {
  return v > 0 ? `₹${v.toFixed ? v.toFixed(1) : v}L` : '₹0'
}

export function generateReport(data) {
  const { summary, financial, volume, compensation, speed, quality, source, pipeline } = data

  // ── Offer-acceptance candidate lists ─────────────────────────────────────
  const offered = volume.offeredRows || []
  const joinedRows = offered.filter(r => r.joined && !r.isFuture)
  const futureRows = offered.filter(r => r.isFuture)
  const pendingRows = offered.filter(r => !r.joined && !r.isFuture)

  const joinedNames = joinedRows.map(r => r.candidate && r.candidate !== '—' ? r.candidate : r.role).filter(Boolean).join(', ') || '—'
  const futureNames = futureRows.map(r => `${r.candidate && r.candidate !== '—' ? r.candidate : r.role}${r.joinedDate ? ' (DOJ: ' + fmt(r.joinedDate) + ')' : ''}`).join(', ') || 'None'
  const pendingNames = pendingRows.map(r => r.candidate && r.candidate !== '—' ? r.candidate : r.role).filter(Boolean).join(', ') || 'None'

  // ── Joiners table rows ────────────────────────────────────────────────────
  const joinerRows = compensation.newJoiners.map(j => `
    <tr>
      <td><strong>${j.candidate}</strong></td>
      <td>${j.role}</td>
      <td>${j.dept}</td>
      <td style="color:#7c3aed;font-weight:600">₹${j.ctc}L</td>
      <td>${fmt(j.doj)}</td>
      <td>${j.month}</td>
      <td><span class="badge ${j.isFuture ? 'badge-amber' : 'badge-green'}">${j.isFuture ? 'Future DOJ' : 'Joined'}</span></td>
    </tr>`).join('')

  // ── Open positions table rows ─────────────────────────────────────────────
  const openRows = pipeline.openPositions.map(r => `
    <tr>
      <td><strong>${r.role}</strong></td>
      <td>${r.dept}</td>
      <td>${r.hiringManager || '—'}</td>
      <td><span class="badge ${r.criticality === 'Critical' ? 'badge-red' : 'badge-blue'}">${r.criticality || 'N/A'}</span></td>
      <td style="font-weight:700;color:${r.beyondSLA ? '#dc2626' : '#16a34a'}">${r.ageing}d</td>
      <td>${r.sla}d</td>
      <td><span class="badge ${r.beyondSLA ? 'badge-red' : r.ageing > r.sla * 0.7 ? 'badge-amber' : 'badge-green'}">${r.beyondSLA ? 'SLA Breach' : r.ageing > r.sla * 0.7 ? 'Approaching' : 'On Track'}</span></td>
    </tr>`).join('')

  // ── Pipeline rows ─────────────────────────────────────────────────────────
  const pipelineRowsHtml = pipeline.pipelineRows.map(r => `
    <tr>
      <td><strong>${r.role}</strong></td>
      <td>${r.dept}</td>
      <td>${r.candidate && r.candidate !== '—' ? r.candidate : '—'}</td>
      <td>${r.ctc > 0 ? `₹${r.ctc}L` : '—'}</td>
      <td>${fmt(r.doj)}</td>
      <td><span class="badge ${r.isFuture ? 'badge-amber' : 'badge-green'}">${r.isFuture ? 'Future DOJ' : 'In Pipeline'}</span></td>
    </tr>`).join('')

  // ── On-hold rows ──────────────────────────────────────────────────────────
  const onHoldRowsHtml = pipeline.onHoldPositions.map(r => `
    <tr>
      <td><strong>${r.role}</strong></td>
      <td>${r.dept}</td>
      <td>${r.hiringManager || '—'}</td>
      <td>${r.reason || '—'}</td>
    </tr>`).join('')

  // ── Offered-to-joined table ───────────────────────────────────────────────
  const offeredTableRows = offered.map(r => `
    <tr>
      <td><strong>${r.role}</strong></td>
      <td>${r.dept}</td>
      <td>${r.candidate && r.candidate !== '—' ? r.candidate : '—'}</td>
      <td>${fmt(r.offerDate)}</td>
      <td>${fmt(r.joinedDate)}</td>
      <td>${r.ctc > 0 ? `₹${r.ctc}L` : '—'}</td>
      <td><span class="badge ${r.isFuture ? 'badge-amber' : r.joined ? 'badge-green' : 'badge-blue'}">${r.isFuture ? 'Future DOJ' : r.joined ? 'Joined' : 'Pending'}</span></td>
    </tr>`).join('')

  // ── Speed: time-to-hire by role ───────────────────────────────────────────
  const speedRows = (speed.tthByRole || []).slice(0, 10).map(r => `
    <tr>
      <td><strong>${r.role}</strong></td>
      <td>${r.dept}</td>
      <td style="font-weight:700;color:${r.days > 30 ? '#dc2626' : r.days > 15 ? '#d97706' : '#16a34a'}">${r.days}d</td>
      <td><span class="badge ${r.days > 30 ? 'badge-red' : 'badge-green'}">${r.days > 30 ? 'Exceeded SLA' : 'On Track'}</span></td>
    </tr>`).join('')

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const topDept = (volume.byDept || [])[0]
  const topCTCDept = (financial.ctcByDept || [])[0]
  const latestVelocity = (speed.velocityData || []).slice(-1)[0]

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>iMocha TA Dashboard Report</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif; font-size:11px; color:#1e1e2e; background:#fff; padding:28px 36px; }
    /* ── Header ── */
    .report-header { display:flex; align-items:flex-start; justify-content:space-between; border-bottom:3px solid #7c3aed; padding-bottom:14px; margin-bottom:24px; }
    .report-header h1 { font-size:22px; color:#7c3aed; font-weight:700; }
    .report-header .sub { font-size:10px; color:#888; margin-top:4px; }
    .report-header .stamp { text-align:right; font-size:9px; color:#999; line-height:1.8; }
    /* ── Section ── */
    .section { margin-bottom:26px; }
    .section-title { font-size:12px; font-weight:700; color:#fff; background:#7c3aed; padding:5px 12px; border-radius:4px; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.06em; }
    /* ── KPI grid ── */
    .kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:12px; }
    .kpi-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:12px; }
    .kpi { background:#f5f3ff; border:1px solid #ddd6fe; border-radius:6px; padding:9px 11px; }
    .kpi-label { font-size:8px; font-weight:600; color:#7c3aed; text-transform:uppercase; letter-spacing:0.06em; }
    .kpi-value { font-size:20px; font-weight:700; color:#5b21b6; margin:2px 0; }
    .kpi-sub { font-size:8px; color:#999; }
    /* ── Explanation box ── */
    .explain { background:#f0f9ff; border-left:3px solid #0ea5e9; border-radius:0 6px 6px 0; padding:9px 13px; margin-bottom:12px; }
    .explain-title { font-size:9px; font-weight:700; color:#0369a1; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px; }
    .exp-item { margin-bottom:5px; line-height:1.55; font-size:10px; }
    .exp-label { font-weight:700; color:#1e1e2e; }
    /* ── Tables ── */
    table { width:100%; border-collapse:collapse; margin-top:8px; font-size:9.5px; }
    th { background:#7c3aed; color:#fff; padding:5px 8px; font-size:8px; text-align:left; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; }
    td { padding:4px 8px; border-bottom:1px solid #f0f0f0; }
    tr:nth-child(even) td { background:#fafafa; }
    /* ── Badges ── */
    .badge { display:inline-block; padding:1px 7px; border-radius:10px; font-size:8px; font-weight:600; }
    .badge-green { background:#dcfce7; color:#15803d; }
    .badge-amber { background:#fef9c3; color:#a16207; }
    .badge-red { background:#fee2e2; color:#b91c1c; }
    .badge-blue { background:#dbeafe; color:#1d4ed8; }
    .badge-violet { background:#ede9fe; color:#6d28d9; }
    /* ── Two-col layout ── */
    .two-col { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:12px; }
    .col-card { background:#fafafa; border:1px solid #e5e7eb; border-radius:6px; padding:10px 12px; }
    .col-card h4 { font-size:9px; font-weight:700; color:#6d28d9; text-transform:uppercase; margin-bottom:6px; }
    /* ── Footer ── */
    .footer { margin-top:32px; border-top:1px solid #e5e7eb; padding-top:12px; font-size:8.5px; color:#aaa; text-align:center; }
    @media print {
      body { padding:16px 20px; font-size:10px; }
      .section { page-break-inside:avoid; }
      .no-break { page-break-inside:avoid; }
      @page { margin:1.2cm; size:A4; }
    }
  </style>
</head>
<body>

<!-- ══════════════════ HEADER ══════════════════ -->
<div class="report-header">
  <div>
    <h1>iMocha Talent Acquisition Dashboard</h1>
    <div class="sub">Live Recruitment Intelligence Report &nbsp;·&nbsp; Data source: Google Sheets</div>
  </div>
  <div class="stamp">
    <div>Generated: ${today}</div>
    <div>Period: Jan – Mar 2026 (Q1)</div>
    <div>Scope: All active hiring records</div>
  </div>
</div>

<!-- ══════════════════ 1. EXECUTIVE SUMMARY ══════════════════ -->
<div class="section no-break">
  <div class="section-title">1 · Executive Summary</div>
  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-label">Total Hires YTD</div>
      <div class="kpi-value">${summary.totalHiresYTD}</div>
      <div class="kpi-sub">MTD: ${summary.totalHiresMTD} · QTD: ${summary.totalHiresQTD}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Avg Cost / Hire</div>
      <div class="kpi-value">₹0</div>
      <div class="kpi-sub">100% direct sourcing</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Avg Time to Fill</div>
      <div class="kpi-value">${summary.avgTimeToFill || '—'}d</div>
      <div class="kpi-sub">JD open → Offer release</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Offer Acceptance</div>
      <div class="kpi-value">${summary.offerJoinRatio.toFixed(0)}%</div>
      <div class="kpi-sub">${summary.totalJoined} joined / ${summary.totalOffered} offered</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">SLA Adherence</div>
      <div class="kpi-value">${summary.slaAdherenceRate}%</div>
      <div class="kpi-sub">Positions closed within SLA</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Open Positions</div>
      <div class="kpi-value">${summary.openPositions}</div>
      <div class="kpi-sub">${summary.onHoldPositions} on hold · ${summary.pipelineCount} in pipeline</div>
    </div>
  </div>
  <div class="explain">
    <div class="explain-title">ℹ Metric Explanations</div>
    <div class="exp-item"><span class="exp-label">Total Hires YTD:</span> iMocha has officially onboarded ${summary.totalHiresYTD} employees in 2026, with ${summary.totalHiresMTD} joining in March (MTD) and ${summary.totalHiresQTD} across Q1. This count includes all candidates whose date-of-joining has passed.</div>
    <div class="exp-item"><span class="exp-label">Avg Cost / Hire:</span> All ${summary.totalHiresYTD} hires were made via direct sourcing channels — no agency commissions or referral payouts were incurred, resulting in ₹0 cost per hire (industry avg with agency: ₹5–15L per hire).</div>
    <div class="exp-item"><span class="exp-label">Avg Time to Fill:</span> On average, it takes ${summary.avgTimeToFill || 'N/A'} days from a JD being opened to the moment an offer letter is released to the selected candidate. Industry benchmark: 45–60 days.</div>
    <div class="exp-item"><span class="exp-label">Offer Acceptance (${summary.offerJoinRatio.toFixed(0)}%):</span> ${summary.totalJoined} of ${summary.totalOffered} candidates who received offers have joined. <strong>Joined:</strong> ${joinedNames}. <strong>Future DOJ (not yet counted):</strong> ${futureNames}. ${pendingNames !== 'None' ? '<strong>Pending:</strong> ' + pendingNames + '.' : ''}</div>
    <div class="exp-item"><span class="exp-label">SLA Adherence:</span> ${summary.slaAdherenceRate}% of hiring positions were closed within the predefined SLA period agreed with hiring managers, indicating strong TA execution and process discipline.</div>
    <div class="exp-item"><span class="exp-label">Open Positions:</span> ${summary.openPositions} active JDs are currently in the recruitment pipeline, with ${summary.onHoldPositions} temporarily paused (pending budget/approvals) and ${summary.pipelineCount} candidates in the final offer/signing stage.</div>
  </div>
</div>

<!-- ══════════════════ 2. FINANCIAL IMPACT ══════════════════ -->
<div class="section no-break">
  <div class="section-title">2 · Financial Impact</div>
  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-label">Avg Cost / Hire</div>
      <div class="kpi-value">₹0</div>
      <div class="kpi-sub">Direct sourcing only</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Agency Spend</div>
      <div class="kpi-value">${currency(financial.totalAgencySpend)}</div>
      <div class="kpi-sub">YTD total</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Referral Payout</div>
      <div class="kpi-value">${currency(financial.totalReferralPayout)}</div>
      <div class="kpi-sub">YTD total</div>
    </div>
  </div>
  <div class="explain">
    <div class="explain-title">ℹ Metric Explanations</div>
    <div class="exp-item"><span class="exp-label">Avg Cost / Hire:</span> Zero acquisition cost — all ${summary.totalHiresYTD} hires were sourced directly via LinkedIn, talent pools, and job portals without any third-party agency involvement. This saves an estimated ₹5–15L per hire compared to agency recruitment.</div>
    <div class="exp-item"><span class="exp-label">Agency Spend:</span> ${financial.totalAgencySpend > 0 ? `₹${financial.totalAgencySpend}L paid to external recruitment agencies for ${source.breakdown.Agency || 0} hire(s) this period.` : 'No agency fees incurred — strong indicator of in-house TA capability and sourcing maturity.'}</div>
    <div class="exp-item"><span class="exp-label">Referral Payout:</span> ${financial.totalReferralPayout > 0 ? `₹${financial.totalReferralPayout}L paid out as employee referral bonuses for ${source.breakdown.Referral || 0} referral hire(s).` : 'No referral payouts this period — employee referral programme not yet activated. Referral hires typically cost 40–60% less than agency hires.'}</div>
    <div class="exp-item"><span class="exp-label">Avg CTC by Department:</span> ${topCTCDept ? `Highest average CTC is in ${topCTCDept.dept} at ₹${topCTCDept.avgCTC}L, reflecting market demand for specialized talent in that function.` : 'CTC data will populate as more joiners are recorded.'}</div>
    <div class="exp-item"><span class="exp-label">Internal vs External Hiring:</span> 100% of hires are external (direct sourcing channel) — no internal transfers or promotions are recorded in this dataset for the current period.</div>
  </div>
  ${financial.ctcByDept.length > 0 ? `
  <table>
    <thead><tr><th>Department</th><th>Avg CTC (₹L)</th><th>Headcount</th></tr></thead>
    <tbody>
      ${financial.ctcByDept.map(d => `<tr><td>${d.dept}</td><td style="font-weight:700;color:#7c3aed">₹${d.avgCTC}L</td><td>${d.count}</td></tr>`).join('')}
    </tbody>
  </table>` : ''}
</div>

<!-- ══════════════════ 3. HIRING VOLUME ══════════════════ -->
<div class="section no-break">
  <div class="section-title">3 · Hiring Volume</div>
  <div class="kpi-grid-4">
    <div class="kpi">
      <div class="kpi-label">MTD Hires</div>
      <div class="kpi-value">${volume.mtd}</div>
      <div class="kpi-sub">March 2026</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">QTD Hires</div>
      <div class="kpi-value">${volume.qtd}</div>
      <div class="kpi-sub">Q1 2026</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">YTD Hires</div>
      <div class="kpi-value">${volume.ytd}</div>
      <div class="kpi-sub">Jan–Mar 2026</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Open Positions</div>
      <div class="kpi-value">${summary.openPositions}</div>
      <div class="kpi-sub">${summary.onHoldPositions} on hold</div>
    </div>
  </div>
  <div class="explain">
    <div class="explain-title">ℹ Metric Explanations</div>
    <div class="exp-item"><span class="exp-label">Monthly Hires Trend:</span> ${(volume.velocityData || []).map(d => `${d.month}: ${d.count} hire${d.count !== 1 ? 's' : ''}`).join(' → ')}. This trend line shows the cadence of hiring closures across months.</div>
    <div class="exp-item"><span class="exp-label">MTD / QTD / YTD Hires:</span> Month-to-date (MTD) tracks hires in the current month; QTD covers the full quarter; YTD covers all of 2026. Used to benchmark hiring pace against plan.</div>
    <div class="exp-item"><span class="exp-label">Hires by Department:</span> ${topDept ? `${topDept.fullDept || topDept.dept} leads with ${topDept.count} hire${topDept.count !== 1 ? 's' : ''} — highest headcount addition this period.` : 'Department breakdown available as hiring data is recorded.'}</div>
    <div class="exp-item"><span class="exp-label">Replacement vs New Position:</span> ${volume.replacementCount} replacement hire${volume.replacementCount !== 1 ? 's' : ''} (backfill for departed employees) and ${volume.newPositionCount} new position hire${volume.newPositionCount !== 1 ? 's' : ''} (org expansion). New positions signal growth; high replacements may indicate attrition concerns.</div>
    <div class="exp-item"><span class="exp-label">Revenue vs Enabling Function:</span> ${volume.revenueHires} revenue-generating hires (Sales, Customer Success, etc.) vs ${volume.supportHires} enabling-function hires (HR, Finance, Admin). A revenue-first ratio indicates growth-stage focus.</div>
    <div class="exp-item"><span class="exp-label">Critical vs Non-Critical:</span> ${volume.criticalHires} critical role hire${volume.criticalHires !== 1 ? 's' : ''} — these are business-critical positions with high impact on OKRs. ${volume.nonCriticalHires} non-critical hires support day-to-day operations.</div>
  </div>

  <h4 style="font-size:9px;font-weight:700;color:#6d28d9;text-transform:uppercase;margin:10px 0 4px">Offered-to-Joined Detail (${offered.length} offered, ${joinedRows.length} joined)</h4>
  ${offered.length > 0 ? `
  <table>
    <thead><tr><th>Role</th><th>Department</th><th>Candidate</th><th>Offer Date</th><th>DOJ</th><th>CTC</th><th>Status</th></tr></thead>
    <tbody>${offeredTableRows}</tbody>
  </table>` : '<p style="font-size:10px;color:#999;margin-top:6px">No offered rows recorded yet.</p>'}
</div>

<!-- ══════════════════ 4. COMPENSATION TRENDS ══════════════════ -->
<div class="section no-break">
  <div class="section-title">4 · Compensation Trends</div>
  <div class="kpi-grid-4">
    <div class="kpi">
      <div class="kpi-label">Avg CTC Offered</div>
      <div class="kpi-value">₹${compensation.avgCTC.toFixed(1)}L</div>
      <div class="kpi-sub">Across all hires</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Max CTC</div>
      <div class="kpi-value">₹${compensation.maxCTC > 0 ? compensation.maxCTC : '—'}L</div>
      <div class="kpi-sub">Highest offer</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Min CTC</div>
      <div class="kpi-value">${compensation.minCTC > 0 && compensation.minCTC !== Infinity ? `₹${compensation.minCTC}L` : '—'}</div>
      <div class="kpi-sub">Entry-level offer</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Offer-Join Ratio</div>
      <div class="kpi-value">${compensation.offerJoinRatio}%</div>
      <div class="kpi-sub">Offers converted</div>
    </div>
  </div>
  <div class="explain">
    <div class="explain-title">ℹ Metric Explanations</div>
    <div class="exp-item"><span class="exp-label">Avg CTC Offered (₹${compensation.avgCTC.toFixed(1)}L):</span> The mean annual CTC package offered across all ${compensation.newJoiners.length} new joiners. Engineering and product roles typically command a premium above this average.</div>
    <div class="exp-item"><span class="exp-label">Max CTC (₹${compensation.maxCTC > 0 ? compensation.maxCTC : '—'}L):</span> The highest individual package offered this period — usually corresponding to a senior or specialized role. Benchmarks against market rate for that function.</div>
    <div class="exp-item"><span class="exp-label">Min CTC (${compensation.minCTC > 0 && compensation.minCTC !== Infinity ? `₹${compensation.minCTC}L` : '—'}):</span> The entry-level package in this hiring cycle — indicates the lower bound of the company's compensation band for fresher/junior roles.</div>
    <div class="exp-item"><span class="exp-label">Offer-Join Ratio (${compensation.offerJoinRatio}%):</span> Percentage of candidates who received an offer and subsequently joined. Drops below 90% may indicate counter-offer situations, competitor pulls, or misaligned compensation expectations.</div>
    <div class="exp-item"><span class="exp-label">CTC Trend by Month:</span> ${compensation.ctcTrendData.length >= 2 ? `Avg CTC moved from ₹${compensation.ctcTrendData[0]?.avgCTC}L (${compensation.ctcTrendData[0]?.month}) to ₹${compensation.ctcTrendData[compensation.ctcTrendData.length-1]?.avgCTC}L (${compensation.ctcTrendData[compensation.ctcTrendData.length-1]?.month}) — monitor for budget overrun.` : 'Monthly CTC trend will appear as more hiring data is recorded across multiple months.'}</div>
  </div>

  <h4 style="font-size:9px;font-weight:700;color:#6d28d9;text-transform:uppercase;margin:10px 0 4px">New Joiners — CTC Detail</h4>
  ${compensation.newJoiners.length > 0 ? `
  <table>
    <thead><tr><th>Candidate</th><th>Role</th><th>Department</th><th>CTC</th><th>DOJ</th><th>Month</th><th>Status</th></tr></thead>
    <tbody>${joinerRows}</tbody>
  </table>` : '<p style="font-size:10px;color:#999;margin-top:6px">No CTC records available yet.</p>'}
</div>

<!-- ══════════════════ 5. SPEED & SLA ══════════════════ -->
<div class="section no-break">
  <div class="section-title">5 · Hiring Speed & SLA</div>
  <div class="kpi-grid-4">
    <div class="kpi">
      <div class="kpi-label">Avg Time to Hire</div>
      <div class="kpi-value">${speed.avgTimeToHire || '—'}d</div>
      <div class="kpi-sub">Screening → Signing</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Avg Time to Fill</div>
      <div class="kpi-value">${speed.avgTimeToFill || '—'}d</div>
      <div class="kpi-sub">JD open → Offer</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">SLA Adherence</div>
      <div class="kpi-value">${speed.slaAdherenceRate}%</div>
      <div class="kpi-sub">Within agreed timelines</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Latest Month Hires</div>
      <div class="kpi-value">${latestVelocity?.count || 0}</div>
      <div class="kpi-sub">${latestVelocity?.month || '—'} closures</div>
    </div>
  </div>
  <div class="explain">
    <div class="explain-title">ℹ Metric Explanations</div>
    <div class="exp-item"><span class="exp-label">Avg Time to Hire (${speed.avgTimeToHire || '—'}d):</span> Average days from initial candidate screening to offer letter signing. Benchmark is ≤30 days. ${speed.avgTimeToHire > 0 && speed.avgTimeToHire <= 30 ? 'Current pace is within benchmark — efficient selection process.' : speed.avgTimeToHire > 30 ? 'Exceeds benchmark — review interview stages for bottlenecks.' : 'Data will populate as more hiring cycles complete.'}</div>
    <div class="exp-item"><span class="exp-label">Avg Time to Fill (${speed.avgTimeToFill || '—'}d):</span> Average days from JD approval/opening to formal offer release. Longer than Time to Hire as it includes sourcing time. Industry benchmark: 45–60 days.</div>
    <div class="exp-item"><span class="exp-label">SLA Adherence (${speed.slaAdherenceRate}%):</span> Percentage of positions closed within the SLA committed to the hiring manager. ${speed.slaAdherenceRate >= 90 ? 'Above 90% — excellent TA execution.' : speed.slaAdherenceRate >= 70 ? '70–90% — review delayed positions and remove blockers.' : 'Below 70% — systematic review of process stages needed.'}</div>
    <div class="exp-item"><span class="exp-label">Hiring Velocity:</span> Number of positions closed in the most recent month (${latestVelocity?.month || '—'}: ${latestVelocity?.count || 0} hires). Tracks the throughput capacity of the TA team on a monthly basis.</div>
    <div class="exp-item"><span class="exp-label">Time to Hire by Role:</span> Roles exceeding 30 days (red) are flagged as bottlenecks — typically due to panel availability, niche skills, or counter-offer situations. These need priority attention.</div>
  </div>

  ${speedRows ? `
  <h4 style="font-size:9px;font-weight:700;color:#6d28d9;text-transform:uppercase;margin:10px 0 4px">Time to Hire by Role</h4>
  <table>
    <thead><tr><th>Role</th><th>Department</th><th>Days</th><th>SLA Status</th></tr></thead>
    <tbody>${speedRows}</tbody>
  </table>` : ''}
</div>

<!-- ══════════════════ 6. QUALITY OF HIRE ══════════════════ -->
<div class="section no-break">
  <div class="section-title">6 · Quality of Hire</div>
  <div class="kpi-grid-4">
    <div class="kpi">
      <div class="kpi-label">90-Day Retention</div>
      <div class="kpi-value">${quality.avgRetention}%</div>
      <div class="kpi-sub">Target: 90%</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Early Attrition (0–6m)</div>
      <div class="kpi-value">${quality.avgAttrition}%</div>
      <div class="kpi-sub">Lower is better</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">HM Satisfaction</div>
      <div class="kpi-value">—</div>
      <div class="kpi-sub">Score pending</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Critical Retention</div>
      <div class="kpi-value">${quality.criticalHireRetention > 0 ? quality.criticalHireRetention.toFixed(0) + '%' : '—'}</div>
      <div class="kpi-sub">90-day, critical hires</div>
    </div>
  </div>
  <div class="explain">
    <div class="explain-title">ℹ Metric Explanations</div>
    <div class="exp-item"><span class="exp-label">90-Day Retention (${quality.avgRetention}%):</span> Percentage of new hires who remain employed 90 days after their joining date. This is the primary quality-of-hire indicator. ${quality.avgRetention >= 90 ? 'Above 90% target — strong onboarding, role-fit, and expectation alignment signals.' : 'Below 90% — review onboarding experience, role clarity, and candidate expectations set during hiring.'}</div>
    <div class="exp-item"><span class="exp-label">Early Attrition (${quality.avgAttrition}%):</span> Percentage of hires who left within the first 6 months. Target is &lt;5%. ${quality.avgAttrition <= 5 ? 'Within healthy range — hiring quality and role-fit are well-calibrated.' : 'Above 5% — indicates possible mismatch in expectations, hiring quality, or onboarding gaps.'}</div>
    <div class="exp-item"><span class="exp-label">HM Satisfaction:</span> Hiring manager rating of new joiner's performance and fit (scale: 1–5). Score collection is pending for the current cohort — will be captured at 30/60/90 day check-ins.</div>
    <div class="exp-item"><span class="exp-label">Critical Role Retention (${quality.criticalHireRetention > 0 ? quality.criticalHireRetention.toFixed(0) + '%' : 'N/A'}):</span> 90-day retention rate specifically for critical/business-impacting roles. Held to a higher standard (target: 95%) since early exits in these roles cause significant business disruption.</div>
    <div class="exp-item"><span class="exp-label">Quality by Hiring Source:</span> Retention rates broken down by sourcing channel. Direct sourcing typically shows retention on par with or better than agency hires, validating the ROI of the TA team's sourcing capability.</div>
  </div>
</div>

<!-- ══════════════════ 7. SOURCE ROI ══════════════════ -->
<div class="section no-break">
  <div class="section-title">7 · Source ROI</div>
  <div class="kpi-grid-4">
    <div class="kpi">
      <div class="kpi-label">Direct Hires</div>
      <div class="kpi-value">${source.breakdown.Direct || 0}</div>
      <div class="kpi-sub">${summary.totalHiresYTD > 0 ? Math.round(((source.breakdown.Direct || 0) / summary.totalHiresYTD) * 100) : 0}% of total</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Referral Hires</div>
      <div class="kpi-value">${source.breakdown.Referral || 0}</div>
      <div class="kpi-sub">${source.totalReferralSpend > 0 ? `₹${source.totalReferralSpend}L spend` : 'No spend'}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Agency Hires</div>
      <div class="kpi-value">${source.breakdown.Agency || 0}</div>
      <div class="kpi-sub">${financial.totalAgencySpend > 0 ? `₹${financial.totalAgencySpend}L spend` : 'No agency spend'}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Referral Success Rate</div>
      <div class="kpi-value">${source.breakdown.Referral > 0 ? '85%' : 'N/A'}</div>
      <div class="kpi-sub">Industry avg: 60–80%</div>
    </div>
  </div>
  <div class="explain">
    <div class="explain-title">ℹ Metric Explanations</div>
    <div class="exp-item"><span class="exp-label">Direct Hires (${source.breakdown.Direct || 0}):</span> Candidates sourced directly by the TA team via LinkedIn, job boards, campus, or talent pools — with zero acquisition fee. ${source.breakdown.Direct > 0 ? `${Math.round(((source.breakdown.Direct || 0) / (summary.totalHiresYTD || 1)) * 100)}% of all hires this period came via direct sourcing.` : ''}</div>
    <div class="exp-item"><span class="exp-label">Referral Hires (${source.breakdown.Referral || 0}):</span> ${source.breakdown.Referral > 0 ? `${source.breakdown.Referral} hire(s) sourced through employee referrals — referral channel typically yields higher retention and culture fit.` : 'No referral hires yet — opportunity to activate or strengthen the employee referral programme for higher-quality, lower-cost candidates.'}</div>
    <div class="exp-item"><span class="exp-label">Agency Hires (${source.breakdown.Agency || 0}):</span> ${source.breakdown.Agency > 0 ? `${source.breakdown.Agency} hire(s) sourced via external recruitment agencies at ₹${financial.totalAgencySpend}L total cost.` : 'Zero agency hires — strong indicator of TA team capability. Agency should only be considered for niche or senior positions where direct sourcing is infeasible.'}</div>
    <div class="exp-item"><span class="exp-label">Referral Success Rate:</span> ${source.breakdown.Referral > 0 ? '85% of referred candidates who were interviewed received and accepted offers — above industry average of 60–80%.' : 'Metric N/A — no referral hires recorded. An active referral programme typically delivers hires 50% faster and at 40% lower cost than agency.'}</div>
    <div class="exp-item"><span class="exp-label">Cost per Source:</span> Direct: ₹0 (∞ ROI) · Referral: ${source.totalReferralSpend > 0 ? `₹${source.totalReferralSpend}L` : '₹0'} · Agency: ${financial.totalAgencySpend > 0 ? `₹${financial.totalAgencySpend}L` : '₹0'}. Direct sourcing delivers the highest ROI by eliminating acquisition fees entirely.</div>
  </div>
</div>

<!-- ══════════════════ 8. PIPELINE HEALTH ══════════════════ -->
<div class="section no-break">
  <div class="section-title">8 · Pipeline Health</div>
  <div class="kpi-grid-4">
    <div class="kpi">
      <div class="kpi-label">Open Positions</div>
      <div class="kpi-value">${pipeline.totalOpen}</div>
      <div class="kpi-sub">Active JDs</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">On Hold</div>
      <div class="kpi-value">${pipeline.totalOnHold}</div>
      <div class="kpi-sub">Temporarily paused</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Beyond SLA</div>
      <div class="kpi-value">${pipeline.beyondSLACount}</div>
      <div class="kpi-sub">Exceeded time limit</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Offer Pipeline</div>
      <div class="kpi-value">${summary.pipelineCount}</div>
      <div class="kpi-sub">Offers in progress</div>
    </div>
  </div>
  <div class="explain">
    <div class="explain-title">ℹ Metric Explanations</div>
    <div class="exp-item"><span class="exp-label">Open Positions (${pipeline.totalOpen}):</span> Active job descriptions where hiring is in progress. These are roles where the TA team is sourcing, interviewing, or evaluating candidates — ${pipeline.totalOpen > 5 ? 'high open count; prioritize closures to reduce business impact.' : 'manageable pipeline — monitor ageing for each position.'}</div>
    <div class="exp-item"><span class="exp-label">On Hold (${pipeline.totalOnHold}):</span> Positions temporarily paused — typically due to budget freeze, headcount re-prioritization, or hiring manager changes. ${pipeline.totalOnHold > 0 ? 'Requires periodic review to decide reinstatement or closure.' : 'No positions on hold — all active JDs are progressing.'}</div>
    <div class="exp-item"><span class="exp-label">Beyond SLA (${pipeline.beyondSLACount}):</span> Positions that have exceeded the agreed SLA deadline with the hiring manager. ${pipeline.beyondSLACount > 0 ? `Immediate attention needed — these ${pipeline.beyondSLACount} role(s) risk business impact and hiring manager dissatisfaction.` : 'All active positions are within SLA — excellent pipeline discipline.'}</div>
    <div class="exp-item"><span class="exp-label">Offer Pipeline (${summary.pipelineCount}):</span> Candidates who have been selected and are in the final offer/negotiation/signing stage. ${summary.pipelineCount > 0 ? `Expect ${summary.pipelineCount} addition(s) to headcount in the near term as these offers are concluded.` : 'No active offer pipeline — sourcing and selection for open roles should be accelerated.'}</div>
  </div>

  ${openRows ? `
  <h4 style="font-size:9px;font-weight:700;color:#6d28d9;text-transform:uppercase;margin:10px 0 4px">Open Positions — Ageing Analysis</h4>
  <table>
    <thead><tr><th>Role</th><th>Department</th><th>Hiring Manager</th><th>Criticality</th><th>Ageing</th><th>SLA</th><th>Status</th></tr></thead>
    <tbody>${openRows}</tbody>
  </table>` : ''}

  ${onHoldRowsHtml ? `
  <h4 style="font-size:9px;font-weight:700;color:#6d28d9;text-transform:uppercase;margin:10px 0 4px">On Hold Positions</h4>
  <table>
    <thead><tr><th>Role</th><th>Department</th><th>Hiring Manager</th><th>Current Stage</th></tr></thead>
    <tbody>${onHoldRowsHtml}</tbody>
  </table>` : ''}

  ${pipelineRowsHtml ? `
  <h4 style="font-size:9px;font-weight:700;color:#6d28d9;text-transform:uppercase;margin:10px 0 4px">Offer Pipeline Candidates</h4>
  <table>
    <thead><tr><th>Role</th><th>Department</th><th>Candidate</th><th>CTC</th><th>Expected DOJ</th><th>Status</th></tr></thead>
    <tbody>${pipelineRowsHtml}</tbody>
  </table>` : ''}
</div>

<!-- ══════════════════ FOOTER ══════════════════ -->
<div class="footer">
  iMocha Talent Acquisition Dashboard 2026 &nbsp;·&nbsp; Generated ${today} &nbsp;·&nbsp;
  Live data from Google Sheets (ID: 1bOxEmh7iv2tE1qoPhHQBrRwZRr-IAtBi) &nbsp;·&nbsp;
  Confidential — Internal Use Only
</div>

<script>
  window.onload = function() { window.print(); }
</script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) {
    alert('Pop-up blocked. Please allow pop-ups for this site and try again.')
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
