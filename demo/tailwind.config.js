const fls = require('../src/index.js')

module.exports = {
  content: ['./demo/pages/**/*.{js,mdx}', './demo/components/**/*.{js,mdx}'],
  transform: {
    mdx: content => require('@mdx-js/mdx').sync(content)
  },
  theme: {
    grid: {
      mobile: {
        columns: 10,
        gutter: 0.1,
        margin: 20,
        mockupWidth: 375
      },
      tablet: {
        columns: 10,
        gutter: 0.1,
        margin: 30,
        mockupWidth: 768,
        screen: 'md'
      },
      desktop: {
        columns: 12,
        gutter: 0.1,
        margin: 60,
        mockupWidth: 1440,
        maxWidth: 1920,
        screen: 'lg'
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
