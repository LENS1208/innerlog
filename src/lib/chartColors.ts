export function getGridLineColor(): string {
  if (typeof window === 'undefined') return 'rgba(226, 232, 240, 0.5)'

  const root = document.documentElement
  const computedStyle = getComputedStyle(root)
  const gridLineColor = computedStyle.getPropertyValue('--grid-line').trim()

  return gridLineColor || 'rgba(226, 232, 240, 0.5)'
}
