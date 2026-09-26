import createMDX from '@next/mdx'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
}

const withMDX = createMDX({
  options: { rehypePlugins: [['rehype-pretty-code', { theme: 'vesper', keepBackground: false }]] }
})

export default withMDX(nextConfig)