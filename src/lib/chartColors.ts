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
