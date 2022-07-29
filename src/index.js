const plugin = require('tailwindcss/plugin')

const utilities = {
  w: 'width',
  'w-min': 'min-width',
  'w-max': 'max-width',
  h: 'height',
  'h-min': 'min-height',
  'h-max': 'max-height',
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
  ml: 'margin-left'
}

const toRem = value => {
  return value / 16
}

// -----------------------------------------------------o spans & gutters

/**
 * converts a column count to rem in a grid context
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
    return `calc(${count} * var(--column) + ${count - 1 + spreading} * var(--gutter))`
  }
}

/**
 * converts a gutter to rem in a grid context
 * @param count n
 * @param grid
 */
const gutter = (count = 1, grid = null) => {
  return grid ? count * grid.gutter : count === 1 ? 'var(--gutter)' : `calc(${count} * var(--gutter))`
}

/**
 * return the margin in rem
 * @param count n
 * @param grid
 */
const margin = (count = 1, grid = null) => {
  return grid ? count * grid.margin : count === 1 ? 'var(--margin)' : `calc(${count} * var(--margin))`
}

const gridContainer = () => {
  return {
    '.grid-container': {
      display: 'block',
      margin: '0 auto',
      width: 'var(--grid-width)'
    },
    '.grid-container-full': {
      marginLeft: 'calc(var(--margin) * -1)',
      width: 'calc(var(--grid-width) + 2 * var(--margin))'
    }
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
        'max-width': 'calc(var(--max-width) - var(--sbw))'
      }
    }
  }

  for (const [key, grid] of Object.entries(grids)) {
    if (grid.screen) {
      o.body['&::after'][parseScreen(screens[grid.screen])] = {
        background: guideline(grid, color)
      }
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

        addBase({
          html: {
            '--sbw': '0px'
          }
        })

        const vw = (100 * 16) / grid.mockupWidth
        const gridWidth = grid.mockupWidth - 2 * grid.margin
        const gutter = (gridWidth * grid.gutter) / grid.columns

        const vars = {
          '--grid-width': `${toRem(gridWidth).toFixed(3)}rem`,
          '--max-width': grid.maxWidth ? `${grid.maxWidth}px` : null,
          '--margin': `${toRem(grid.margin).toFixed(3)}rem`,
          '--gutter': `${toRem(gutter).toFixed(3)}rem`,
          '--column': `${toRem((gridWidth - (grid.columns - 1) * gutter) / grid.columns).toFixed(3)}rem`,
          fontSize: `calc(${vw}vw - var(--sbw) * ${16 / grid.mockupWidth})`
        }

        if (mediaQuery) {
          addBase({
            html: {
              [mediaQuery]: vars
            }
          })
          if (grid.maxWidth) {
            addBase({
              html: {
                [mediaQuery]: {
                  fontSize: `min(calc(${vw}vw - var(--sbw) * ${16 / grid.mockupWidth}), ${(16 * grid.maxWidth) / grid.mockupWidth}px)`
                }
              }
            })
          }
        } else {
          addBase({
            html: vars
          })
          if (grid.maxWidth) {
            addBase({
              html: {
                fontSize: `min(calc(${vw}vw - var(--sbw) * ${16 / grid.mockupWidth}), ${(16 * grid.maxWidth) / grid.mockupWidth}px)`
              }
            })
          }
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

      if (options?.enabled || (options?.enabled === undefined && process.env.NODE_ENV === 'development')) {
        addBase(guidelines(grids, theme('screens'), options?.color || 'red'))
      }
    }
  },
  options => {
    return {
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
      }
    }
  }
)

module.exports = grid
