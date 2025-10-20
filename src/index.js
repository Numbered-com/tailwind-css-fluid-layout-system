const plugin = require('tailwindcss/plugin')

const utilities = {
  w: 'width',
  'min-w': 'min-width',
  'max-w': 'max-width',
  h: 'height',
  'min-h': 'min-height',
  'max-h': 'max-height',
  p: 'padding',
  px: ['padding-left', 'padding-right'],
  py: ['padding-top', 'padding-bottom'],
  pt: 'padding-top',
  pr: 'padding-right',
  pb: 'padding-bottom',
  pl: 'padding-left',
  m: 'margin',
  mx: ['margin-left', 'margin-right'],
  my: ['margin-top', 'margin-bottom'],
  mt: 'margin-top',
  mr: 'margin-right',
  mb: 'margin-bottom',
  ml: 'margin-left',
  'scroll-m': 'scroll-margin',
  'scroll-mx': ['scroll-margin-left', 'scroll-margin-right'],
  'scroll-my': ['scroll-margin-top', 'scroll-margin-bottom'],
  'scroll-mt': 'scroll-margin-top',
  'scroll-mr': 'scroll-margin-right',
  'scroll-mb': 'scroll-margin-bottom',
  'scroll-ml': 'scroll-margin-left',
  'scroll-p': 'scroll-padding',
  'scroll-px': ['scroll-padding-left', 'scroll-padding-right'],
  'scroll-py': ['scroll-padding-top', 'scroll-padding-bottom'],
  'scroll-pt': 'scroll-padding-top',
  'scroll-pr': 'scroll-padding-right',
  'scroll-pb': 'scroll-padding-bottom',
  'scroll-pl': 'scroll-padding-left',
  inset: ['top', 'right', 'bottom', 'left'],
  'inset-x': ['right', 'left'],
  'inset-y': ['top', 'bottom'],
  top: 'top',
  right: 'right',
  bottom: 'bottom',
  left: 'left',
  gap: 'gap',
  'gap-x': 'column-gap',
  'gap-y': 'row-gap',
  indent: 'text-indent',
  border: 'border-width',
  'border-t': 'border-top-width',
  'border-r': 'border-right-width',
  'border-b': 'border-bottom-width',
  'border-l': 'border-left-width',
  'border-x': ['border-left-width', 'border-right-width'],
  'border-y': ['border-top-width', 'border-bottom-width']
}

// -----------------------------------------------------o spans & gutters

/**
 * Span
 * @return matching amount of columns including gutters
 * @param col n | n-wide | n-wider
 * @param grid
 */
const span = (col = 1, grid = null) => {
  let count
  let spreadingInstruction

  if (typeof col === 'string') {
    ;[count, spreadingInstruction] = col.split(' ')
    count = parseFloat(count)
  } else {
    count = col
  }

  if (count === 0) return 0

  if (grid) {
    const gridWidth = grid.mockupWidth - 2 * grid.margin
    const gutter = (gridWidth * grid.gutter) / grid.columns
    const column = (gridWidth - (grid.columns - 1) * gutter) / grid.columns
    const spreading = spreadingInstruction === 'wide' ? gutter : spreadingInstruction === 'wider' ? gutter * 2 : 0
    return count * column + (count - 1) * gutter + spreading
  } else {
    const spreading = spreadingInstruction === 'wide' ? 1 : spreadingInstruction === 'wider' ? 2 : 0
    return `calc(${count} * var(--column) + ${count - (1 - spreading) * Math.sign(count)} * var(--gutter))`
  }
}

/**
 * Gutter
 * @return matching amount of gutters
 * @param count n
 * @param grid
 */
const gutter = (count = 1, grid = null) => {
  return grid ? count * grid.gutter : count === 1 ? 'var(--gutter)' : `calc(${count} * var(--gutter))`
}

/**
 * Margin
 * @return matching amount of margins
 * @param count n
 * @param grid
 */
const margin = (count = 1, grid = null) => {
  return grid ? count * grid.margin : count === 1 ? 'var(--margin)' : `calc(${count} * var(--margin))`
}

const gridContainer = () => {
  return {
    '.grid-container': { display: 'block', marginLeft: 'auto', marginRight: 'auto', width: 'var(--grid-width)' },
    '.grid-container-full': { marginLeft: 'calc(var(--margin) * -1)', width: 'calc(var(--grid-width) + 2 * var(--margin))' }
  }
}

const guideline = (grid, color = 'red') => {
  let style = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="${color}" width="100%">`

  for (let i = 0; i < grid.columns; i++) {
    const spanX = ((margin(1, grid) + span(i, grid)) * 100) / grid.mockupWidth

    style += `<rect x="${spanX}%" width="0.5px" height="100%"/>`

    if (i && grid.gutter) {
      const gutterX = ((margin(1, grid) + span(`${i} wide`, grid)) * 100) / grid.mockupWidth

      style += `<rect x="${gutterX}%" width="0.5px" height="100%"/>`
    }
  }

  const last = ((margin(1, grid) + span(grid.columns, grid)) * 100) / grid.mockupWidth

  style += `<rect x="${last}%" width="0.5px" height="100%"/>`
  style += `</svg>') no-repeat scroll`

  return style
}

const guidelines = (grids, screens, color = 'red') => {
  const o = {
    body: {
      '&::after': {
        content: "''",
        position: 'fixed',
        'z-index': 99999,
        width: 'calc(var(--grid-width) + 2 * var(--margin))',
        height: '100%',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        'pointer-events': 'none',
        background: guideline(grids.mobile, color),
        visibility: 'var(--guidelines-visibility, "inherit")'
      }
    }
  }

  for (const [key, grid] of Object.entries(grids)) {
    if (grid.screen) {
      o.body['&::after'][parseScreen(screens[grid.screen])] = { background: guideline(grid, color) }
    }
  }

  return o
}

// -----------------------------------------------------o Plugin

const parseScreen = screen => {
  if (typeof screen === 'string' && !screen.max) {
    return `@media (min-width: ${screen})`
  } else if (typeof screen === 'object') {
    return `@media (${screen.min !== undefined ? `min-width: ${screen.min}` : ''}${screen.min !== undefined && screen.max !== undefined ? ') and (' : ''}${
      screen.max !== undefined ? `max-width: ${screen.max}` : ''
    })`
  }
}

const matchUtilitiesFor = (key, fn, matchUtilities, values) => {
  for (const utility in utilities) {
    const element = utilities[utility]

    matchUtilities(
      {
        [`${key}-${utility}`]: value => {
          return Array.isArray(element)
            ? element.reduce((result, item) => {
                result[item] = `${fn(value)}`
                return result
              }, {})
            : { [element]: `${fn(value)}` }
        }
      },
      { values }
    )
  }
}

const grid = plugin.withOptions(
  options => {
    return props => {
      const { matchUtilities, addBase, addComponents, theme } = props

      const grids = theme('grid')
      if (grids.mobile === undefined) throw new Error(`grid.mobile is the default and cannot be undefined`)

      for (const key in grids) {
        const grid = grids[key]

        grid.gutter = grid.gutter || 0
        grid.margin = grid.margin || 0

        if (grid.columns === undefined) throw new Error(`columns is required for ${key}`)
        if (grid.mockupWidth === undefined) throw new Error(`mockupWidth is required for ${key}`)
        const mediaQuery = grid.screen ? parseScreen(theme('screens')[grid.screen]) : null

        // base

        const vw = 100 / grid.mockupWidth

        const margin = grid.margin
        const fluidMargin = margin * vw

        const gridWidth = grid.mockupWidth - 2 * margin
        const fluidGridWidth = gridWidth * vw

        const gutter = grid.gutter < 1 ? (gridWidth * grid.gutter) / grid.columns : grid.gutter

        if (grid.gutter >= 1) grid.gutter = (grid.columns * gutter) / gridWidth
        const fluidGutter = gutter * vw

        const column = (gridWidth - (grid.columns - 1) * gutter) / grid.columns
        const fluidColumn = column * vw

        const fontSize = `calc(${(vw * 16).toPrecision(5)}vw - var(--sbw) * ${(16 / grid.mockupWidth).toPrecision(5)})`
        const fontMaxWidth = grid.fontScalingMaxWidth || grid.maxWidth
        const maxFontSize = fontMaxWidth ? `min(${fontSize}, ${((16 * fontMaxWidth) / grid.mockupWidth).toPrecision(3)}px)` : null

        const vars = {
          '--grid-width': `calc(${fluidGridWidth.toPrecision(6)}vw - var(--sbw) * ${(fluidGridWidth / 100).toPrecision(6)})`,
          '--margin': `calc(${fluidMargin.toPrecision(6)}vw - var(--sbw) * ${(fluidMargin / 100).toPrecision(6)})`,
          '--gutter': `calc(${fluidGutter.toPrecision(6)}vw - var(--sbw) * ${(fluidGutter / 100).toPrecision(6)})`,
          '--column': `calc(${fluidColumn.toPrecision(6)}vw - var(--sbw) * ${(fluidColumn / 100).toPrecision(6)})`,
          fontSize: maxFontSize || fontSize
        }

        addBase({
          html: {
            '--sbw': '0px',
            // container-type: inline-size breaks sticky on chrome and old safari...
            // '@supports (container-type: inline-size)': { 'container-type': 'inline-size', '--sbw': 'calc(100vw - 100cqw)' },
            // force sbw to 15px for safari < 18
            // '@supports (hanging-punctuation: first) and (font: -apple-system-body) and (-webkit-appearance: none) and (not (view-transition-name: none))': {
            //   '--sbw': '15px'
            // },
            // mobile reset
            // '@media (pointer: coarse)': { 'container-type': 'revert', '--sbw': '0px' }
            '@media (pointer: fine)': { '--sbw': '17px' }
            // debug
            // '&::before': { content: 'counter(val) "px"', counterReset: 'val tan(atan2(var(--sbw), 1px))', position: 'fixed', color: 'red', 'z-index': 10000 }
          }
          // body: {
          //   overflow: 'overlay'
          // }
        })

        if (mediaQuery) {
          addBase({ html: { [mediaQuery]: vars } })
        } else {
          addBase({ html: vars })
        }

        if (grid.maxWidth) {
          const maxMargin = (margin * grid.maxWidth) / grid.mockupWidth
          const maxGridWidth = grid.maxWidth - 2 * maxMargin
          const maxGutter = (maxGridWidth * grid.gutter) / grid.columns
          const maxColumn = (maxGridWidth - (grid.columns - 1) * maxGutter) / grid.columns

          addBase({
            html: {
              [`@media (min-width: ${grid.maxWidth}px)`]: {
                '--grid-width': `${maxGridWidth.toFixed(5)}px`,
                '--margin': `${maxMargin.toFixed(5)}px`,
                '--gutter': `${maxGutter.toFixed(5)}px`,
                '--column': `${maxColumn.toFixed(5)}px`
              }
            }
          })
        }
      }

      // grid container

      addComponents(gridContainer())

      // utilities

      const maxColumns = Object.entries(grids).reduce((max, entry) => (entry[1].columns >= max[1].columns ? entry : max))?.[1].columns ?? 0

      const getValues = (withExpansion = false) => {
        const values = {}
        new Array(maxColumns).fill(null).forEach((v, i) => {
          const j = i + 1

          values[-j] = -j
          values[j] = j

          if (withExpansion) {
            values[`${-j}-wide`] = `${-j} wide`
            values[`${-j}-wider`] = `${-j} wider`
            values[`${j}-wide`] = `${j} wide`
            values[`${j}-wider`] = `${j} wider`
          }
        })
        return values
      }

      matchUtilitiesFor('span', span, matchUtilities, getValues(true))
      matchUtilitiesFor('gutter', gutter, matchUtilities, getValues())
      matchUtilitiesFor('margin', margin, matchUtilities, getValues())

      // guidelines

      if (options?.guidelines || (options?.guidelines === undefined && process.env.NODE_ENV === 'development')) {
        addBase(guidelines(grids, theme('screens'), options?.color || 'red'))
      }
    }
  },
  options => {
    return {
      theme: {
        grid: {
          mobile: { columns: 10, gutter: 0.1, margin: 20, mockupWidth: 375 },
          tablet: { columns: 10, gutter: 0.1, margin: 30, mockupWidth: 768, screen: 'md' },
          desktop: { columns: 12, gutter: 0.1, margin: 60, mockupWidth: 1440, maxWidth: 1920, screen: 'lg' }
        }
      }
    }
  }
)

module.exports = grid
