export function getGridLineColor(): string {
  if (typeof window === 'undefined') return 'rgba(226, 232, 240, 0.5)'

  const root = document.documentElement
  const computedStyle = getComputedStyle(root)
  const gridLineColor = computedStyle.getPropertyValue('--grid-line').trim()

  return gridLineColor || 'rgba(226, 232, 240, 0.5)'
}

export function getAccentColor(alpha: number = 1): string {
  if (typeof window === 'undefined') return `rgba(0, 132, 199, ${alpha})`

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (alpha === 1) {
    if (isDark) {
      return '#01a1ff'
    }
    return '#0084c7'
  }

  if (isDark) {
    return `rgba(1, 161, 255, ${alpha})`
  }
  return `rgba(0, 132, 199, ${alpha})`
}

export function getLossColor(alpha: number = 1): string {
  if (typeof window === 'undefined') return `rgba(239, 68, 68, ${alpha})`

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (alpha === 1) {
    if (isDark) {
      return '#f87171'
    }
    return '#ef4444'
  }

  if (isDark) {
    return `rgba(248, 113, 113, ${alpha})`
  }
  return `rgba(239, 68, 68, ${alpha})`
}

export function getWarningColor(alpha: number = 1): string {
  if (typeof window === 'undefined') return `rgba(245, 158, 11, ${alpha})`

  return `rgba(245, 158, 11, ${alpha})`
}

export function getPurpleColor(alpha: number = 1): string {
  if (typeof window === 'undefined') return `rgba(147, 51, 234, ${alpha})`

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (alpha === 1) {
    if (isDark) {
      return '#a78bfa'
    }
    return '#9333ea'
  }

  if (isDark) {
    return `rgba(167, 139, 250, ${alpha})`
  }
  return `rgba(147, 51, 234, ${alpha})`
}

export function getOrangeColor(alpha: number = 1): string {
  if (typeof window === 'undefined') return `rgba(249, 115, 22, ${alpha})`

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (alpha === 1) {
    if (isDark) {
      return '#fb923c'
    }
    return '#f97316'
  }

  if (isDark) {
    return `rgba(251, 146, 60, ${alpha})`
  }
  return `rgba(249, 115, 22, ${alpha})`
}

export function getGreenColor(alpha: number = 1): string {
  if (typeof window === 'undefined') return `rgba(34, 197, 94, ${alpha})`

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (alpha === 1) {
    if (isDark) {
      return '#4ade80'
    }
    return '#22c55e'
  }

  if (isDark) {
    return `rgba(74, 222, 128, ${alpha})`
  }
  return `rgba(34, 197, 94, ${alpha})`
}

export function getLongColor(alpha: number = 1): string {
  return getGreenColor(alpha)
}

export function getShortColor(alpha: number = 1): string {
  return getOrangeColor(alpha)
}

export function getProfitColor(alpha: number = 1): string {
  return getAccentColor(alpha)
}

export function createProfitGradient(
  ctx: CanvasRenderingContext2D,
  chartArea: any,
  scales: any
): CanvasGradient {
  const yScale = scales.y
  const zeroPixel = yScale.getPixelForValue(0)
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)

  const zeroPosition = (chartArea.bottom - zeroPixel) / (chartArea.bottom - chartArea.top)
  const clampedZero = Math.max(0, Math.min(1, zeroPosition))

  gradient.addColorStop(0, getLossColor(0.6))
  gradient.addColorStop(clampedZero * 0.95, getLossColor(0.1))
  gradient.addColorStop(clampedZero, 'rgba(200, 200, 200, 0)')
  gradient.addColorStop(clampedZero + (1 - clampedZero) * 0.05, getAccentColor(0.1))
  gradient.addColorStop(1, getAccentColor(0.6))

  return gradient
}

export function createDrawdownGradient(
  ctx: CanvasRenderingContext2D,
  chartArea: any
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)

  gradient.addColorStop(0, getLossColor(0.05))
  gradient.addColorStop(1, getLossColor(0.6))

  return gradient
}
