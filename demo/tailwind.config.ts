import fls from '../src/index.js'
import grid from './grid'
import typography from '@tailwindcss/typography'

export default {
  theme: {
    grid
  },
  plugins: [
    typography,
    fls({
      color: 'rgba(255,107,61,0.12)',
      guidelines: true // force enable guidelines on production env
    })
  ]
}
