const withMDX = require('@next/mdx')()

module.exports = withMDX({
  swcMinify: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
})
