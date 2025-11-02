// src/widgets/DashboardKPI.tsx
import React, { useMemo } from 'react'
import { UI_TEXT, formatCount } from '../lib/i18n'
import { computePipsFromPrices, computeDurationMinutes } from '../lib/metrics'
import type { Trade } from '../lib/types'

export type DashTrade = {
  profitJPY?: number
  profitYen?: number
  pair?: string
  symbol?: string
  side?: string
  pips?: number
  openPrice?: number
  closePrice?: number
  openTime?: string
  datetime?: string
  comment?: string
  memo?: string
}

function getProfit(t: DashTrade): number {
  return t.profitJPY ?? t.profitYen ?? 0
}

function computeDashboard(trades: DashTrade[]) {
  const count = trades.length
  const gross = trades.reduce((a, b) => a + getProfit(b), 0)
  const avg = count ? gross / count : 0
  const wins = trades.filter(t => getProfit(t) > 0).length
  const losses = trades.filter(t => getProfit(t) < 0).length
  const draws = trades.filter(t => getProfit(t) === 0).length

  const winRate = count ? wins / count : 0

  const totalProfit = trades.filter(t => getProfit(t) > 0).reduce((a, b) => a + getProfit(b), 0)
  const totalLoss = Math.abs(trades.filter(t => getProfit(t) < 0).reduce((a, b) => a + getProfit(b), 0))
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : (totalProfit > 0 ? Infinity : 0)

  const avgProfit = wins > 0 ? totalProfit / wins : 0
  const avgLoss = losses > 0 ? totalLoss / losses : 0

  const expectancyJPY = winRate * avgProfit - (1 - winRate) * avgLoss

  let equity = 0
  let peak = 0
  let maxDD = 0
  trades.forEach(t => {
    equity += getProfit(t)
    if (equity > peak) peak = equity
    const dd = peak - equity
    if (dd > maxDD) maxDD = dd
  })

  let totalPips = 0
  let pipsCount = 0
  trades.forEach(t => {
    if (typeof t.pips === 'number') {
      totalPips += t.pips
      pipsCount++
    }
  })
  const avgPips = pipsCount > 0 ? totalPips / pipsCount : 0

  let totalMinutes = 0
  let durationCount = 0
  trades.forEach(t => {
    const dur = computeDurationMinutes(t as Trade)
    if (dur !== null) {
      totalMinutes += dur
      durationCount++
    }
  })
  const avgHoldMin = durationCount > 0 ? totalMinutes / durationCount : null

  // 取引日数を計算
  const tradeDates = new Set<string>()
  trades.forEach(t => {
    const dateStr = t.openTime || t.datetime
    if (dateStr) {
      try {
        const date = new Date(dateStr)
        tradeDates.add(date.toISOString().split('T')[0])
      } catch (e) {}
    }
  })
  const tradingDays = tradeDates.size

  // 獲得リスク比（Expectancy Ratio）
  const riskRewardRatio = avgLoss > 0 ? avgProfit / avgLoss : 0

  // シャープレシオ（簡易版）
  const profits = trades.map(t => getProfit(t))
  const variance = profits.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / (profits.length > 1 ? profits.length - 1 : 1)
  const stdDev = Math.sqrt(variance)
  const sharpeRatio = stdDev > 0 ? avg / stdDev : 0

  return {
    count, gross, avg, wins, losses, draws, winRate,
    profitFactor, totalProfit, totalLoss, avgProfit, avgLoss,
    expectancyJPY, maxDD, totalPips, avgPips, avgHoldMin,
    tradingDays, riskRewardRatio, sharpeRatio
  }
}

function formatMinutesJP(min: number | null): string {
  if (min === null) return '—'
  if (!Number.isFinite(min)) return '—'
  const m = Math.round(min)
  const h = Math.floor(m / 60)
  const r = m % 60
  if (h <= 0) return `${r}分`
  if (r === 0) return `${h}時間`
  return `${h}時間${r}分`
}

const Info: React.FC<{title:string}> = ({title}) => <span className="info" title={title} aria-label="説明">?</span>

function Gauge({ winRate, profitFactor }: { winRate: number; profitFactor: number }) {
  const winPct = Math.round(winRate * 100)
  const lossPct = 100 - winPct
  const pfPct = Math.min(Math.round(profitFactor * 100), 100)

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <svg viewBox="0 0 80 80" style={{ width: 64, height: 64, transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r="32" fill="none" stroke="var(--line)" strokeWidth="9" />
          <circle
            cx="40" cy="40" r="32"
            fill="none"
            stroke="var(--accent-2, #22c55e)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${winPct * 2.01} ${201 - winPct * 2.01}`}
          />
          <circle
            cx="40" cy="40" r="32"
            fill="none"
            stroke="var(--danger, #ef4444)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`0 ${winPct * 2.01} ${lossPct * 2.01}`}
          />
        </svg>
      </div>
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <svg viewBox="0 0 80 80" style={{ width: 64, height: 64, transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r="32" fill="none" stroke="var(--line)" strokeWidth="9" />
          <circle
            cx="40" cy="40" r="32"
            fill="none"
            stroke="var(--accent, #0ea5e9)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${pfPct * 2.01} ${201 - pfPct * 2.01}`}
          />
        </svg>
      </div>
    </div>
  )
}

function SemiGauge({ winRate, wins, draws, losses }: { winRate: number; wins: number; draws: number; losses: number }) {
  const winPct = Math.round(winRate * 100)
  const lossPct = 100 - winPct

  return (
    <div>
      <div style={{ position: 'relative', width: '100%', maxWidth: 120, height: 70 }}>
        <svg viewBox="0 0 120 70" style={{ width: '100%', height: 70 }}>
          <path d="M10,60 A50,50 0 0 1 110,60" fill="none" stroke="var(--line)" strokeWidth="12" pathLength="100" />
          <path d="M10,60 A50,50 0 0 1 110,60" fill="none" stroke="var(--accent-2, #22c55e)" strokeLinecap="round" strokeWidth="12" pathLength="100" strokeDasharray={`${winPct} ${100 - winPct}`} />
          <path d="M10,60 A50,50 0 0 1 110,60" fill="none" stroke="var(--danger, #ef4444)" strokeLinecap="round" strokeWidth="12" pathLength="100" strokeDasharray={`0 ${winPct} ${lossPct}`} />
        </svg>
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 6, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 32, height: 22, padding: '0 6px', borderRadius: 999, fontWeight: 600, fontSize: 12, border: '1px solid rgba(34,197,94,.35)', background: 'rgba(34,197,94,.12)', color: 'var(--accent-2, #22c55e)' }}>{wins}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 32, height: 22, padding: '0 6px', borderRadius: 999, fontWeight: 600, fontSize: 12, border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--muted)' }}>{draws}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 32, height: 22, padding: '0 6px', borderRadius: 999, fontWeight: 600, fontSize: 12, border: '1px solid rgba(239,68,68,.35)', background: 'rgba(239,68,68,.12)', color: 'var(--danger, #ef4444)' }}>{losses}</span>
      </div>
    </div>
  )
}

function BarSplit({ avgProfit, avgLoss }: { avgProfit: number; avgLoss: number }) {
  const total = avgProfit + avgLoss
  const profitPct = total > 0 ? (avgProfit / total) * 100 : 50
  const lossPct = 100 - profitPct

  return (
    <div>
      <div style={{ height: 10, borderRadius: 999, background: 'var(--chip)', border: '1px solid var(--line)', display: 'flex', overflow: 'hidden', marginTop: 6 }}>
        <div style={{ width: `${profitPct}%`, background: 'rgba(34,197,94,.35)' }} />
        <div style={{ width: `${lossPct}%`, background: 'rgba(239,68,68,.35)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontWeight: 600 }}>
        <span style={{ color: 'var(--accent-2, #22c55e)' }}>+{Math.round(avgProfit).toLocaleString('ja-JP')} <span style={{ fontSize: 12, color: 'var(--muted)' }}>円</span></span>
        <span style={{ color: 'var(--danger, #ef4444)' }}>-{Math.round(avgLoss).toLocaleString('ja-JP')} <span style={{ fontSize: 12, color: 'var(--muted)' }}>円</span></span>
      </div>
    </div>
  )
}

export default function DashboardKPI({ trades }: { trades: DashTrade[] }) {
  const dash = useMemo(() => computeDashboard(trades), [trades])

  return (
    <div className="kpi-grid" style={{ marginBottom: 12 }}>
      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>取引件数（取引日数）</div>
        <div className="kpi-value">
          {dash.count} <span className="kpi-unit">件</span> ({dash.tradingDays} <span className="kpi-unit">日</span>)
        </div>
        <div className="kpi-desc">アクティブなトレード件数と日数</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>総損益</div>
        <div className="kpi-value" style={{ color: dash.gross < 0 ? 'var(--danger, #ef4444)' : 'inherit' }}>
          {Math.round(dash.gross).toLocaleString('ja-JP')} <span className="kpi-unit">円</span>
        </div>
        <div className="kpi-desc">全取引の合計損益</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>総獲得pips</div>
        <div className="kpi-value">
          {Math.round(dash.totalPips).toLocaleString('ja-JP')} <span className="kpi-unit">pips</span>
        </div>
        <div className="kpi-desc">全取引のpips合計</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>平均損益</div>
        <div>
          <div className="kpi-value" style={{ color: dash.avg < 0 ? 'var(--danger, #ef4444)' : 'inherit' }}>
            {Math.round(dash.avg).toLocaleString('ja-JP')} <span className="kpi-unit">円/件</span>
          </div>
          <div className="kpi-desc">1取引あたりの平均</div>
          <BarSplit avgProfit={dash.avgProfit} avgLoss={dash.avgLoss} />
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>勝率</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 auto' }}>
            <div className="kpi-value">
              {(dash.winRate * 100).toFixed(1)} <span className="kpi-unit">%</span>
            </div>
          </div>
          <div style={{ flex: '0 0 auto', minWidth: 90 }}>
            <SemiGauge winRate={dash.winRate} wins={dash.wins} draws={dash.draws} losses={dash.losses} />
          </div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>プロフィットファクター</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div className="kpi-value">
              {Number.isFinite(dash.profitFactor) ? dash.profitFactor.toFixed(2) : '∞'}
            </div>
            <div className="kpi-desc">総利益 / 総損失</div>
          </div>
          <div style={{ position: 'relative', width: 64, height: 64 }}>
            <svg viewBox="0 0 80 80" style={{ width: 64, height: 64, transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--line)" strokeWidth="9" />
              <circle
                cx="40" cy="40" r="32"
                fill="none"
                stroke="var(--accent-2, #22c55e)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${Math.min(Math.round(dash.profitFactor * 100), 201)} 201`}
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>最大ドローダウン</div>
        <div className="kpi-value" style={{ color: 'var(--danger, #ef4444)' }}>
          {Math.round(dash.maxDD).toLocaleString('ja-JP')} <span className="kpi-unit">円</span>
        </div>
        <div className="kpi-desc">ピーク→ボトムの最大下落</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>期待値（円）</div>
        <div className="kpi-value" style={{ color: dash.expectancyJPY < 0 ? 'var(--danger, #ef4444)' : 'inherit' }}>
          {Math.round(dash.expectancyJPY).toLocaleString('ja-JP')} <span className="kpi-unit">円/件</span>
        </div>
        <div className="kpi-desc">1取引あたりの平均（円）</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>期待値（pips）</div>
        <div className="kpi-value">
          {dash.avgPips.toFixed(1)} <span className="kpi-unit">pips/件</span>
        </div>
        <div className="kpi-desc">1取引あたりの平均（pips）</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>平均保有時間</div>
        <div className="kpi-value">{formatMinutesJP(dash.avgHoldMin)}</div>
        <div className="kpi-desc">Open→Close の平均</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>獲得リスク比</div>
        <div className="kpi-value">
          {dash.riskRewardRatio.toFixed(2)}
        </div>
        <div className="kpi-desc">平均利益 / 平均損失</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-title" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 15, fontWeight: 'bold', color: 'var(--muted)', margin: '0 0 8px' }}>シャープレシオ</div>
        <div className="kpi-value" style={{ color: dash.sharpeRatio >= 1 ? 'var(--accent-2, #22c55e)' : 'inherit' }}>
          {dash.sharpeRatio.toFixed(2)}
        </div>
        <div className="kpi-desc">リターン / リスク</div>
      </div>
    </div>
  )
}
