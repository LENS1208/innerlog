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
      return '#3db8ff'
    }
    return '#0084c7'
  }

  if (isDark) {
    return `rgba(61, 184, 255, ${alpha})`
  }
  return `rgba(0, 132, 199, ${alpha})`
}

export function getLossColor(alpha: number = 1): string {
  if (typeof window === 'undefined') return `rgba(239, 68, 68, ${alpha})`

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (alpha === 1) {
    if (isDark) {
      return '#ff5757'
    }
    return '#ef4444'
  }

  if (isDark) {
    return `rgba(255, 87, 87, ${alpha})`
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
  if (typeof window === 'undefined') return `rgba(229, 142, 3, ${alpha})`

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (alpha === 1) {
    if (isDark) {
      return '#f59e42'
    }
    return '#e58e03'
  }

  if (isDark) {
    return `rgba(245, 158, 66, ${alpha})`
  }
  return `rgba(229, 142, 3, ${alpha})`
}

export function getGreenColor(alpha: number = 1): string {
  if (typeof window === 'undefined') return `rgba(0, 162, 24, ${alpha})`

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (alpha === 1) {
    if (isDark) {
      return '#33c947'
    }
    return '#00a218'
  }

  if (isDark) {
    return `rgba(51, 201, 71, ${alpha})`
  }
  return `rgba(0, 162, 24, ${alpha})`
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

export function createBlueGradient(
  ctx: CanvasRenderingContext2D,
  chartArea: any,
  direction: 'vertical' | 'horizontal' = 'vertical'
): string {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (isDark) {
    return '#5ba3d0'
  } else {
    return '#3b82c8'
  }
}

export function createGreenGradient(
  ctx: CanvasRenderingContext2D,
  chartArea: any,
  direction: 'vertical' | 'horizontal' = 'vertical'
): string {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (isDark) {
    return '#5dba7a'
  } else {
    return '#3d9e5a'
  }
}

export function createRedGradient(
  ctx: CanvasRenderingContext2D,
  chartArea: any,
  direction: 'vertical' | 'horizontal' = 'vertical'
): string {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (isDark) {
    return '#d97070'
  } else {
    return '#c94d4d'
  }
}

export function createOrangeGradient(
  ctx: CanvasRenderingContext2D,
  chartArea: any,
  direction: 'vertical' | 'horizontal' = 'vertical'
): string {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (isDark) {
    return '#d9a05d'
  } else {
    return '#c97f3d'
  }
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

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (isDark) {
    gradient.addColorStop(0, 'rgba(217, 112, 112, 0.85)')
    gradient.addColorStop(clampedZero * 0.7, 'rgba(217, 112, 112, 0.5)')
    gradient.addColorStop(clampedZero, 'rgba(120, 120, 120, 0.3)')
    gradient.addColorStop(clampedZero + (1 - clampedZero) * 0.3, 'rgba(91, 163, 208, 0.5)')
    gradient.addColorStop(1, 'rgba(91, 163, 208, 0.85)')
  } else {
    gradient.addColorStop(0, 'rgba(201, 77, 77, 0.85)')
    gradient.addColorStop(clampedZero * 0.7, 'rgba(201, 77, 77, 0.5)')
    gradient.addColorStop(clampedZero, 'rgba(100, 100, 100, 0.3)')
    gradient.addColorStop(clampedZero + (1 - clampedZero) * 0.3, 'rgba(59, 130, 200, 0.5)')
    gradient.addColorStop(1, 'rgba(59, 130, 200, 0.85)')
  }

  return gradient
}

export function createDrawdownGradient(
  ctx: CanvasRenderingContext2D,
  chartArea: any
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

  if (isDark) {
    gradient.addColorStop(0, 'rgba(248, 113, 113, 0.15)')
    gradient.addColorStop(1, 'rgba(185, 28, 28, 0.85)')
  } else {
    gradient.addColorStop(0, 'rgba(252, 165, 165, 0.15)')
    gradient.addColorStop(1, 'rgba(153, 27, 27, 0.85)')
  }

  return gradient
}

export const gradientPlugin = {
  id: 'customGradients',
  beforeUpdate: (chart: any) => {
    const { ctx, chartArea, data } = chart

    if (!chartArea || !data.datasets) {
      return
    }

    data.datasets.forEach((dataset: any, datasetIndex: number) => {
      if (dataset.useGradient === 'blue') {
        dataset.backgroundColor = createBlueGradient(ctx, chartArea, 'vertical')
      } else if (dataset.useGradient === 'green') {
        dataset.backgroundColor = createGreenGradient(ctx, chartArea, 'vertical')
      } else if (dataset.useGradient === 'red') {
        dataset.backgroundColor = createRedGradient(ctx, chartArea, 'vertical')
      } else if (dataset.useGradient === 'orange') {
        dataset.backgroundColor = createOrangeGradient(ctx, chartArea, 'vertical')
      } else if (dataset.useGradient === 'profit-bars' && Array.isArray(dataset.data)) {
        dataset.backgroundColor = dataset.data.map((_: any, index: number) => {
          const value = typeof dataset.data[index] === 'object'
            ? dataset.data[index].y
            : dataset.data[index]

          if (value >= 0) {
            return createBlueGradient(ctx, chartArea, 'vertical')
          } else {
            return createRedGradient(ctx, chartArea, 'vertical')
          }
        })
      } else if (dataset.useGradient === 'blue-border') {
        dataset.borderColor = createBlueGradient(ctx, chartArea, 'vertical')
      } else if (dataset.useGradient === 'green-border') {
        dataset.borderColor = createGreenGradient(ctx, chartArea, 'vertical')
      }
    })
  }
}
