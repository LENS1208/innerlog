import React, { useMemo } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import { ja } from 'date-fns/locale'
import type { Trade } from '../lib/types'
import '../lib/dashboard.css'

type TradeWithProfit = {
  profitYen?: number
  profitJPY?: number
  datetime?: string
  time?: number
  pair?: string
  symbol?: string
  side?: 'LONG' | 'SHORT'
  id?: string
  comment?: string
  memo?: string
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
      borderWidth: 2.5,
      borderColor: (context: any) => {
        if (!context.chart.data.datasets[0].data) return '#3b82f6';
        const dataIndex = context.dataIndex;
        if (dataIndex === undefined) return '#3b82f6';
        const value = context.chart.data.datasets[0].data[dataIndex] as number;
        return value >= 0 ? '#16a34a' : '#ef4444';
      },
      backgroundColor: (context: any) => {
        const chart = context.chart;
        const {ctx, chartArea} = chart;
        if (!chartArea) return 'rgba(59, 130, 246, 0.1)';
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        gradient.addColorStop(0.5, 'rgba(200, 200, 200, 0.05)');
        gradient.addColorStop(1, 'rgba(22, 163, 74, 0.4)');
        return gradient;
      },
      pointRadius: 0,
      fill: 'origin',
      tension: 0.4,
      segment: {
        borderColor: (ctx: any) => {
          return ctx.p1.parsed.y >= 0 ? '#16a34a' : '#ef4444';
        }
      }
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
    <div style={{ height: 420, minWidth: 0, width: '100%' }}>
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
    <div style={{ height: 420, minWidth: 0, width: '100%' }}>
      {labels.length ? <Line data={data} options={options} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>データがありません</div>}
    </div>
  )
}

export function DailyProfitChart({ trades }: { trades: TradeWithProfit[] }) {
  const { labels, profits } = useMemo(() => {
    const dailyMap = new Map<string, number>()

    trades.forEach(t => {
      const date = parseDateTime(t.datetime || t.time)
      const dateStr = date.toISOString().split('T')[0]
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + getProfit(t))
    })

    const sorted = Array.from(dailyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    const labels = sorted.map(([date]) => new Date(date).getTime())
    const profits = sorted.map(([, profit]) => profit)

    return { labels, profits }
  }, [trades])

  const data = {
    labels,
    datasets: [{
      label: '日次損益（円）',
      data: profits,
      backgroundColor: profits.map(p => p >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
      borderColor: profits.map(p => p >= 0 ? '#22c55e' : '#ef4444'),
      borderWidth: 1,
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time' as const,
        adapters: { date: { locale: ja } },
        ticks: { maxRotation: 0 },
        time: { tooltipFormat: 'yyyy/MM/dd', unit: 'day' as const },
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
          title: (items: any) => items[0]?.parsed?.x ? new Date(items[0].parsed.x).toLocaleDateString('ja-JP') : '',
          label: (item: any) => `損益: ${item.parsed.y >= 0 ? '+' : ''}${new Intl.NumberFormat('ja-JP').format(item.parsed.y)} 円`
        }
      }
    }
  }

  return (
    <div style={{ height: 420, minWidth: 0, width: '100%' }}>
      {labels.length ? <Bar data={data} options={options} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>データがありません</div>}
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

export function MonthCalendar({ trades }: { trades: TradeWithProfit[] }) {
  const monthData = useMemo(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDay = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const days = []

    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
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
        date: day,
        dateStr,
        weekday: getWeekdayJP(date),
        profit,
        count: dayTrades.length,
        isSat: date.getDay() === 6,
        isSun: date.getDay() === 0,
        isToday: date.toDateString() === today.toDateString()
      })
    }

    return { days, year, month: month + 1 }
  }, [trades])

  const weekDays = ['日', '月', '火', '水', '木', '金', '土']

  return (
    <div>
      <div style={{
        marginBottom: 12,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'var(--ink)'
      }}>
        {monthData.year}年 {monthData.month}月
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4,
        marginBottom: 8
      }}>
        {weekDays.map(day => (
          <div key={day} style={{
            textAlign: 'center',
            fontSize: 12,
            fontWeight: 'bold',
            padding: '4px 0',
            color: day === '日' ? '#ef4444' : day === '土' ? '#3b82f6' : 'var(--muted)'
          }}>
            {day}
          </div>
        ))}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4
      }}>
        {monthData.days.map((day, i) =>
          day === null ? (
            <div key={`empty-${i}`} style={{ minHeight: 80 }} />
          ) : (
            <div
              key={i}
              style={{
                border: '1px solid var(--line)',
                borderRadius: 8,
                padding: 8,
                minHeight: 80,
                backgroundColor: day.isToday ? 'rgba(59, 130, 246, 0.05)' : 'var(--surface)',
                cursor: day.count > 0 ? 'pointer' : 'default',
                transition: 'all 0.2s',
                borderLeft: day.isSun ? '3px solid #ef4444' : day.isSat ? '3px solid #3b82f6' : undefined
              }}
              onClick={() => {
                if (day.count > 0) {
                  location.hash = `/calendar/day/${day.dateStr}`;
                }
              }}
              onMouseEnter={(e) => {
                if (day.count > 0) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                fontSize: 14,
                fontWeight: day.isToday ? 'bold' : 'normal',
                marginBottom: 4,
                color: day.isSun ? '#ef4444' : day.isSat ? '#3b82f6' : 'var(--ink)'
              }}>
                {day.date}
              </div>
              {day.count > 0 && (
                <>
                  <div style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: day.profit >= 0 ? '#22c55e' : '#ef4444',
                    marginBottom: 2
                  }}>
                    {day.profit >= 0 ? '+' : ''}{formatJPY(day.profit)}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: 'var(--muted)'
                  }}>
                    {day.count}件
                  </div>
                </>
              )}
            </div>
          )
        )}
      </div>
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
        dateStr,
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
        <div
          key={i}
          className={`dash-day ${day.isSat ? 'sat' : ''} ${day.isSun ? 'sun' : ''}`}
          onClick={() => {
            if (day.count > 0) {
              location.hash = `/calendar/day/${day.dateStr}`;
            }
          }}
          style={{
            cursor: day.count > 0 ? 'pointer' : 'default'
          }}
        >
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

export function WeekdayChart({ trades }: { trades: TradeWithProfit[] }) {
  const { labels, profits, counts } = useMemo(() => {
    const weekdayMap = new Map<number, { profit: number; count: number }>()

    for (let i = 0; i < 7; i++) {
      weekdayMap.set(i, { profit: 0, count: 0 })
    }

    trades.forEach(t => {
      const date = parseDateTime(t.datetime || t.time)
      const day = date.getDay()
      const current = weekdayMap.get(day)!
      current.profit += getProfit(t)
      current.count += 1
    })

    const days = ['日', '月', '火', '水', '木', '金', '土']
    const labels = days
    const profits = days.map((_, i) => weekdayMap.get(i)!.profit)
    const counts = days.map((_, i) => weekdayMap.get(i)!.count)

    return { labels, profits, counts }
  }, [trades])

  const data = {
    labels,
    datasets: [{
      label: '損益（円）',
      data: profits,
      backgroundColor: profits.map(p => p >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
      borderColor: profits.map(p => p >= 0 ? '#22c55e' : '#ef4444'),
      borderWidth: 1,
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { color: '#f3f4f6' } },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v: any) => new Intl.NumberFormat('ja-JP', { notation: 'compact' }).format(v)
        },
        grid: { color: '#f3f4f6' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item: any) => [
            `損益: ${item.parsed.y >= 0 ? '+' : ''}${new Intl.NumberFormat('ja-JP').format(item.parsed.y)} 円`,
            `取引数: ${counts[item.dataIndex]}回`
          ]
        }
      }
    }
  }

  return (
    <div style={{ height: 200, minWidth: 0, width: '100%' }}>
      {labels.length ? <Bar data={data} options={options} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>データがありません</div>}
    </div>
  )
}

export function TimeOfDayChart({ trades }: { trades: TradeWithProfit[] }) {
  const { labels, profits, counts } = useMemo(() => {
    const hourMap = new Map<number, { profit: number; count: number }>()

    for (let i = 0; i < 24; i++) {
      hourMap.set(i, { profit: 0, count: 0 })
    }

    trades.forEach(t => {
      const date = parseDateTime(t.datetime || t.time)
      const hour = date.getHours()
      const current = hourMap.get(hour)!
      current.profit += getProfit(t)
      current.count += 1
    })

    const labels = Array.from({ length: 24 }, (_, i) => `${i}時`)
    const profits = Array.from({ length: 24 }, (_, i) => hourMap.get(i)!.profit)
    const counts = Array.from({ length: 24 }, (_, i) => hourMap.get(i)!.count)

    return { labels, profits, counts }
  }, [trades])

  const data = {
    labels,
    datasets: [{
      label: '損益（円）',
      data: profits,
      backgroundColor: profits.map(p => p >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
      borderColor: profits.map(p => p >= 0 ? '#22c55e' : '#ef4444'),
      borderWidth: 1,
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: '#f3f4f6' },
        ticks: { maxRotation: 45, minRotation: 45 }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v: any) => new Intl.NumberFormat('ja-JP', { notation: 'compact' }).format(v)
        },
        grid: { color: '#f3f4f6' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item: any) => [
            `損益: ${item.parsed.y >= 0 ? '+' : ''}${new Intl.NumberFormat('ja-JP').format(item.parsed.y)} 円`,
            `取引数: ${counts[item.dataIndex]}回`
          ]
        }
      }
    }
  }

  return (
    <div style={{ height: 200, minWidth: 0, width: '100%' }}>
      {labels.length ? <Bar data={data} options={options} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>データがありません</div>}
    </div>
  )
}

export function CurrencyPairChart({ trades }: { trades: TradeWithProfit[] }) {
  const { labels, profits, counts } = useMemo(() => {
    const pairMap = new Map<string, { profit: number; count: number }>()

    trades.forEach(t => {
      const pair = t.pair || t.symbol
      if (!pair) return
      if (!pairMap.has(pair)) {
        pairMap.set(pair, { profit: 0, count: 0 })
      }
      const current = pairMap.get(pair)!
      current.profit += getProfit(t)
      current.count += 1
    })

    const sorted = Array.from(pairMap.entries()).sort((a, b) => b[1].profit - a[1].profit)
    const labels = sorted.map(([pair]) => pair)
    const profits = sorted.map(([, data]) => data.profit)
    const counts = sorted.map(([, data]) => data.count)

    return { labels, profits, counts }
  }, [trades])

  const data = {
    labels,
    datasets: [{
      label: '損益（円）',
      data: profits,
      backgroundColor: profits.map(p => p >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
      borderColor: profits.map(p => p >= 0 ? '#22c55e' : '#ef4444'),
      borderWidth: 1,
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (v: any) => new Intl.NumberFormat('ja-JP', { notation: 'compact' }).format(v)
        },
        grid: { color: '#f3f4f6' }
      },
      y: { grid: { color: '#f3f4f6' } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item: any) => [
            `損益: ${item.parsed.x >= 0 ? '+' : ''}${new Intl.NumberFormat('ja-JP').format(item.parsed.x)} 円`,
            `取引数: ${counts[item.dataIndex]}回`
          ]
        }
      }
    }
  }

  return (
    <div style={{ height: 200, minWidth: 0, width: '100%' }}>
      {labels.length ? <Bar data={data} options={options} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>データがありません</div>}
    </div>
  )
}

export function SegmentCharts({ trades }: { trades: TradeWithProfit[] }) {
  return (
    <div className="dash-row-3">
      <div className="dash-card">
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 'bold', color: 'var(--muted)' }}>曜日別</h3>
        <WeekdayChart trades={trades} />
      </div>
      <div className="dash-card">
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 'bold', color: 'var(--muted)' }}>時間帯別</h3>
        <TimeOfDayChart trades={trades} />
      </div>
      <div className="dash-card">
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 'bold', color: 'var(--muted)' }}>通貨ペア別</h3>
        <CurrencyPairChart trades={trades} />
      </div>
    </div>
  )
}

export function SetupChart({ trades }: { trades?: TradeWithProfit[] }) {
  const setupData = useMemo(() => {
    if (!trades || trades.length === 0) return []

    // comment/memoからセットアップを抽出
    const extractSetup = (t: any): string => {
      const text = ((t.comment || t.memo || '') as string).toLowerCase()
      if (text.includes('breakout') || text.includes('ブレイクアウト')) return 'Breakout'
      if (text.includes('pullback') || text.includes('プルバック')) return 'Pullback'
      if (text.includes('reversal') || text.includes('反転')) return 'Reversal'
      if (text.includes('trend') || text.includes('トレンド')) return 'Trend'
      if (text.includes('range') || text.includes('レンジ')) return 'Range'
      if (text.includes('scalp') || text.includes('スキャルプ')) return 'Scalp'
      return 'Other'
    }

    const map = new Map<string, { profit: number; count: number; wins: number }>()
    trades.forEach(t => {
      const setup = extractSetup(t)
      const profit = getProfit(t)
      const current = map.get(setup) || { profit: 0, count: 0, wins: 0 }
      map.set(setup, {
        profit: current.profit + profit,
        count: current.count + 1,
        wins: current.wins + (profit > 0 ? 1 : 0),
      })
    })

    return Array.from(map.entries())
      .map(([setup, data]) => ({
        setup,
        ...data,
        winRate: data.count > 0 ? (data.wins / data.count) * 100 : 0,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 6)
  }, [trades])

  if (!trades || trades.length === 0) {
    return (
      <div className="dash-card">
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 'bold', color: 'var(--muted)' }}>セットアップ別（タグ）</h3>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          データがありません
        </div>
      </div>
    )
  }

  if (setupData.length === 0) {
    return (
      <div className="dash-card">
        <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 'bold', color: 'var(--muted)' }}>セットアップ別（タグ）</h3>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
          セットアップタグが見つかりません<br/>
          <span style={{ fontSize: 12 }}>メモに「ブレイクアウト」「トレンド」などを記載してください</span>
        </div>
      </div>
    )
  }

  return (
    <div className="dash-card">
      <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 'bold', color: 'var(--muted)' }}>セットアップ別（タグ）</h3>
      <div style={{ height: 240 }}>
        <Bar
          data={{
            labels: setupData.map(s => s.setup),
            datasets: [
              {
                label: '損益',
                data: setupData.map(s => s.profit),
                backgroundColor: setupData.map(s =>
                  s.profit >= 0 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                ),
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const item = setupData[context.dataIndex]
                    return [
                      `損益: ${formatJPY(item.profit)}円`,
                      `取引: ${item.count}件`,
                      `勝率: ${item.winRate.toFixed(1)}%`,
                    ]
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => `${formatJPY(value as number)}円`,
                },
              },
            },
          }}
        />
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)' }}>
        取引メモから「ブレイクアウト」「トレンド」「レンジ」などのキーワードで分類
      </div>
    </div>
  )
}

export function ProfitDistributionChart({ trades }: { trades: TradeWithProfit[] }) {
  const distributionData = useMemo(() => {
    const ranges = [
      { label: '-5万円以下', min: -Infinity, max: -50000 },
      { label: '-5万～-2万円', min: -50000, max: -20000 },
      { label: '-2万～-1万円', min: -20000, max: -10000 },
      { label: '-1万～-5千円', min: -10000, max: -5000 },
      { label: '-5千円～0円', min: -5000, max: 0 },
      { label: '0～5千円', min: 0, max: 5000 },
      { label: '5千～1万円', min: 5000, max: 10000 },
      { label: '1万～2万円', min: 10000, max: 20000 },
      { label: '2万～5万円', min: 20000, max: 50000 },
      { label: '5万円以上', min: 50000, max: Infinity },
    ]

    const counts = ranges.map(range => {
      return trades.filter(t => {
        const profit = getProfit(t)
        return profit > range.min && profit <= range.max
      }).length
    })

    return { ranges, counts }
  }, [trades])

  const data = {
    labels: distributionData.ranges.map(r => r.label),
    datasets: [{
      label: '取引回数',
      data: distributionData.counts,
      backgroundColor: distributionData.ranges.map((r, i) =>
        r.max <= 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 197, 94, 0.8)'
      ),
    }]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `取引回数: ${context.parsed.y}件`
        }
      }
    },
    scales: {
      x: {
        grid: { color: '#f3f4f6' },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: { size: 11 }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `${value}件`,
          stepSize: 200
        },
        grid: { color: '#f3f4f6' }
      }
    }
  }

  return (
    <div className="dash-card">
      <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 'bold', color: 'var(--muted)' }}>損益分布</h3>
      <div style={{ height: 360, minWidth: 0, width: '100%' }}>
        {trades.length ? <Bar data={data} options={options} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>データがありません</div>}
      </div>
    </div>
  )
}

export function HoldingTimeDistributionChart({ trades }: { trades: TradeWithProfit[] }) {
  const distributionData = useMemo(() => {
    const ranges = [
      { label: '30分以内', min: 0, max: 30 },
      { label: '30分～1時間', min: 30, max: 60 },
      { label: '1～2時間', min: 60, max: 120 },
      { label: '2～4時間', min: 120, max: 240 },
      { label: '4～8時間', min: 240, max: 480 },
      { label: '8～24時間', min: 480, max: 1440 },
      { label: '1日以上', min: 1440, max: Infinity },
    ]

    const winCounts = ranges.map(() => 0)
    const lossCounts = ranges.map(() => 0)

    trades.forEach(t => {
      const profit = getProfit(t)
      let holdingTimeMin = 0

      if (typeof t.time === 'number' && (t as any).openTimeMs) {
        holdingTimeMin = (t.time - (t as any).openTimeMs) / (1000 * 60)
      } else if (t.datetime && (t as any).openTime) {
        const closeTime = parseDateTime(t.datetime).getTime()
        const openTime = parseDateTime((t as any).openTime).getTime()
        holdingTimeMin = (closeTime - openTime) / (1000 * 60)
      }

      if (!Number.isFinite(holdingTimeMin) || holdingTimeMin < 0) return

      const rangeIndex = ranges.findIndex(r => holdingTimeMin > r.min && holdingTimeMin <= r.max)
      if (rangeIndex >= 0) {
        if (profit > 0) {
          winCounts[rangeIndex]++
        } else {
          lossCounts[rangeIndex]++
        }
      }
    })

    return { ranges, winCounts, lossCounts }
  }, [trades])

  const data = {
    labels: distributionData.ranges.map(r => r.label),
    datasets: [
      {
        label: '勝ちトレード',
        data: distributionData.winCounts,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: '負けトレード',
        data: distributionData.lossCounts,
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: { font: { size: 12 } }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y}件`
        }
      }
    },
    scales: {
      x: {
        stacked: false,
        grid: { color: '#f3f4f6' },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: { size: 11 }
        }
      },
      y: {
        stacked: false,
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `${value}件`,
          stepSize: 200
        },
        grid: { color: '#f3f4f6' }
      }
    }
  }

  return (
    <div className="dash-card">
      <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 'bold', color: 'var(--muted)' }}>保有時間分布</h3>
      <div style={{ height: 360, minWidth: 0, width: '100%' }}>
        {trades.length ? <Bar data={data} options={options} /> : <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>データがありません</div>}
      </div>
    </div>
  )
}
