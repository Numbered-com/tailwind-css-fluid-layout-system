export type Grid = {
  columns: number
  gutter: number
  margin: number
  mockupWidth: number
  screen?: string
  maxWidth?: number
  fontScalingMaxWidth?: number
}

const grid: Record<string, Grid> = {
  mobile: { columns: 6, gutter: 0.1, margin: 10, mockupWidth: 375, fontScalingMaxWidth: 500 },
  tablet: { columns: 6, gutter: 10, margin: 24, mockupWidth: 768, screen: 'md' },
  desktop: { columns: 12, gutter: 10, margin: 24, mockupWidth: 1440, fontScalingMaxWidth: 1540, screen: 'lg' }
}

export default grid
