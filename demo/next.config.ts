import createMDX from '@next/mdx'

import type { NextConfig } from 'next'

// Code theme built from the demo palette (globals.css tokens).
const theme = {
  "name": "fls",
  "type": "dark",
  "colors": {
    "editor.background": "#1c1a17",
    "editor.foreground": "#ede6da"
  },
  "tokenColors": [
    {
      "scope": [
        "comment",
        "punctuation.definition.comment"
      ],
      "settings": {
        "foreground": "#6b645b",
        "fontStyle": "italic"
      }
    },
    {
      "scope": [
        "punctuation",
        "meta.brace",
        "keyword.operator"
      ],
      "settings": {
        "foreground": "#9a9185"
      }
    },
    {
      "scope": [
        "keyword",
        "storage",
        "storage.type",
        "support.function",
        "entity.name.function"
      ],
      "settings": {
        "foreground": "#ff6b3d"
      }
    },
    {
      "scope": [
        "string",
        "string.quoted"
      ],
      "settings": {
        "foreground": "#ffb199"
      }
    },
    {
      "scope": [
        "constant.numeric",
        "constant.language"
      ],
      "settings": {
        "foreground": "#ff6b3d"
      }
    },
    {
      "scope": [
        "meta.object-literal.key",
        "support.type.property-name",
        "variable.other.property"
      ],
      "settings": {
        "foreground": "#ede6da"
      }
    },
    {
      "scope": [
        "variable",
        "variable.parameter",
        "entity.name"
      ],
      "settings": {
        "foreground": "#ede6da"
      }
    }
  ]
}

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
}

const withMDX = createMDX({
  options: { rehypePlugins: [['rehype-pretty-code', { theme, keepBackground: false }]] }
})

export default withMDX(nextConfig)