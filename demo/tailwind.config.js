import fls from '../src/index.js'
import typography from '@tailwindcss/typography'

export default {
  theme: {
    grid: {
      mobile: { columns: 6, gutter: 0.1, margin: 10, mockupWidth: 375, fontScalingMaxWidth: 500 },
      tablet: { columns: 6, gutter: 10, margin: 24, mockupWidth: 768, screen: 'md' },
      desktop: {
        columns: 12,
        gutter: 10,
        margin: 24,
        mockupWidth: 1440,
        fontScalingMaxWidth: 1540,
        screen: 'lg'
        // maxWidth: 1680,
      }
    }
  },
  plugins: [
    typography,
    fls({
      color: 'rgba(255,107,61,0.12)',
      guidelines: true // force enable guidelines on production env
    })
  ]
}
