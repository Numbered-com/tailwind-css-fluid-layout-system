const fls = require('../src/index.js')

module.exports = {
  content: ['./demo/**/*.{js,mdx}'],
  transform: { mdx: content => require('@mdx-js/mdx').sync(content) },
  theme: {
    grid: {
      mobile: { columns: 6, gutter: 0.1, margin: 10, mockupWidth: 375, fontScalingMaxWidth: 500 },
      tablet: { columns: 6, gutter: 10, margin: 30, mockupWidth: 768, screen: 'md' },
      desktop: {
        columns: 12,
        gutter: 10,
        margin: 0,
        mockupWidth: 1440,
        fontScalingMaxWidth: 1540,
        screen: 'lg'
        // maxWidth: 1680,
      }
    }
  },
  variants: {},
  plugins: [
    require('@tailwindcss/typography'),
    fls({
      color: 'rgba(255,0,0,0.6)',
      guidelines: true // force enable guidelines on production env
    })
  ]
}
