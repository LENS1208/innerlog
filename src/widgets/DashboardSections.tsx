import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { ja } from 'date-fns/locale'
import type { Trade } from '../lib/types'
import '../lib/dashboard.css'

type TradeWithProfit = {
  profitYen?: number
  profitJPY?: number
  datetime?: string
  time?: number
  pair?: string
  side?: 'LONG' | 'SHORT'
  id?: string
}

function getProfit(t: TradeWithProfit): number {
  return t.profitYen ?? t.profitJPY ?? 0
}

function formatJPY(v: number) {
  return Math.round(v).toLocaleString('ja-JP')
}

function getWeekdayJP(date: Date): string {
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return days[date.getDay()]
}

function parseDateTime(datetime: string | number | undefined): Date {
  if (!datetime) return new Date()
  if (typeof datetime === 'number') return new Date(datetime)
  const dt = datetime.replace(' ', 'T')
  return new Date(dt)
}

function formatDateSafe(date: Date): string {
  if (isNaN(date.getTime())) return '無効な日付'
  return date.toLocaleDateString('ja-JP')
}

export function EquityChart({ trades }: { trades: TradeWithProfit[] }) {
  const { labels, equity } = useMemo(() => {
    const sorted = [...trades].sort((a, b) => parseDateTime(a.datetime || a.time).getTime() - parseDateTime(b.datetime || b.time).getTime())
    const labels = sorted.map(t => parseDateTime(t.datetime || t.time).getTime())
    const equity: number[] = []
    let acc = 0
    for (const t of sorted) {
      acc += getProfit(t)
      equity.push(acc)
    }
    return { labels, equity }
  }, [trades])

  const data = {
    labels,
    datasets: [{
      label: '累積損益（円）',
      data: equity,
      borderWidth: 2,
      borderColor: '#1976d2',
      pointRadius: 0,
      fill: false,
      tension: 0.2,
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    spanGaps: true,
    interaction: { mode: 'index' as const, intersect: false },
    scales: {
      x: {
        type: 'time' as const,
        adapters: { date: { locale: ja } },
        ticks: { maxRotation: 0 },
        time: { tooltipFormat: 'yyyy/MM/dd HH:mm' },
        grid: { color: '#f3f4f6' }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v: any) => new Intl.NumberFormat('ja-JP').format(v) + ' 円'
        },
        grid: { color: '#f3f4f6' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: any) => items[0]?.parsed?.x ? new Date(items[0].parsed.x).toLocaleString('ja-JP') : '',
          label: (item: any) => `累積損益: ${new Intl.NumberFormat('ja-JP').format(item.parsed.y)} 円`
        }
      }
    }
  }

  return (
    <div style={{ height: 420 }}>
      {labels.length ? <Line data={data} options={options} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>データがありません</div>}
    </div>
  )
}

export function DrawdownChart({ trades }: { trades: TradeWithProfit[] }) {
  const { labels, dd } = useMemo(() => {
    const sorted = [...trades].sort((a, b) => parseDateTime(a.datetime || a.time).getTime() - parseDateTime(b.datetime || b.time).getTime())
    const labels = sorted.map(t => parseDateTime(t.datetime || t.time).getTime())
    let equity = 0
    let peak = 0
    const dd: number[] = []
    for (const t of sorted) {
      equity += getProfit(t)
      if (equity > peak) peak = equity
      dd.push(peak - equity)
    }
    return { labels, dd }
  }, [trades])

  const data = {
    labels,
    datasets: [{
      label: 'ドローダウン（円）',
      data: dd,
      borderWidth: 2,
      borderColor: '#ef4444',
      pointRadius: 0,
      fill: true,
      backgroundColor: 'rgba(239,68,68,0.1)',
      tension: 0.2,
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    spanGaps: true,
    interaction: { mode: 'index' as const, intersect: false },
    scales: {
      x: {
        type: 'time' as const,
        adapters: { date: { locale: ja } },
        ticks: { maxRotation: 0 },
        time: { tooltipFormat: 'yyyy/MM/dd HH:mm' },
        grid: { color: '#f3f4f6' }
      },
      y: {
        beginAtZero: true,
        reverse: true,
        ticks: {
          callback: (v: any) => new Intl.NumberFormat('ja-JP').format(v) + ' 円'
        },
        grid: { color: '#f3f4f6' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: any) => items[0]?.parsed?.x ? new Date(items[0].parsed.x).toLocaleString('ja-JP') : '',
          label: (item: any) => `DD: ${new Intl.NumberFormat('ja-JP').format(item.parsed.y)} 円`
        }
      }
    }
  }

  return (
    <div style={{ height: 420 }}>
      {labels.length ? <Line data={data} options={options} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>データがありません</div>}
    </div>
  )
}

export function DailyProfitChart({ trades }: { trades: TradeWithProfit[] }) {
  return (
    <div className="chart-placeholder">
      日次損益チャート（実装予定）
    </div>
  )
}

export function RecentTradesTable({ trades }: { trades: TradeWithProfit[] }) {
  const topTrades = useMemo(() => {
    const sorted = [...trades].sort((a, b) => Math.abs(getProfit(b)) - Math.abs(getProfit(a)))
    return sorted.slice(0, 5)
  }, [trades])

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>約定日</th>
            <th>通貨</th>
            <th>サイド</th>
            <th>損益</th>
          </tr>
        </thead>
        <tbody>
          {topTrades.map((t, i) => {
            const profit = getProfit(t)
            return (
              <tr key={i}>
                <td>{formatDateSafe(parseDateTime(t.datetime || t.time))}</td>
                <td>{t.pair}</td>
                <td>{t.side === 'LONG' ? '買い' : '売り'}</td>
                <td className={profit >= 0 ? 'accent-2' : 'danger'}>
                  {profit >= 0 ? '+' : ''}{formatJPY(profit)}円
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function WeekCalendar({ trades }: { trades: TradeWithProfit[] }) {
  const weekData = useMemo(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]

      const dayTrades = trades.filter(t => {
        if (!t.datetime && !t.time) return false
        try {
          const tDate = parseDateTime(t.datetime || t.time).toISOString().split('T')[0]
          return tDate === dateStr
        } catch {
          return false
        }
      })

      const profit = dayTrades.reduce((sum, t) => sum + getProfit(t), 0)

      days.push({
        date: date.getDate(),
        weekday: getWeekdayJP(date),
        profit,
        count: dayTrades.length,
        isSat: date.getDay() === 6,
        isSun: date.getDay() === 0
      })
    }

    return days
  }, [trades])

  return (
    <div className="dash-cal">
      {weekData.map((day, i) => (
        <div key={i} className={`dash-day ${day.isSat ? 'sat' : ''} ${day.isSun ? 'sun' : ''}`}>
          <div className="dash-day-date">
            <span className="d">{day.date}</span>
            <span className="w">（{day.weekday}）</span>
          </div>
          <div className={`dash-pill ${day.profit >= 0 ? 'pos' : 'neg'}`}>
            {day.profit >= 0 ? '+' : ''}{formatJPY(day.profit)}円
          </div>
          <small>取引: {day.count}</small>
        </div>
      ))}
    </div>
  )
}

export function SegmentCharts() {
  return (
    <div className="dash-row-3">
      <div className="dash-card">
        <h3 style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--muted)' }}>曜日別</h3>
        <div className="chart-placeholder chart-sm">曜日別チャート（実装予定）</div>
      </div>
      <div className="dash-card">
        <h3 style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--muted)' }}>時間帯別</h3>
        <div className="chart-placeholder chart-sm">時間帯別チャート（実装予定）</div>
      </div>
      <div className="dash-card">
        <h3 style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--muted)' }}>通貨ペア別</h3>
        <div className="chart-placeholder chart-sm">通貨ペア別チャート（実装予定）</div>
      </div>
    </div>
  )
}

export function SetupChart() {
  return (
    <div className="dash-card">
      <h3 style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--muted)' }}>セットアップ別（タグ）</h3>
      <div className="chart-placeholder chart-sm">セットアップ別チャート（実装予定）</div>
    </div>
  )
}
