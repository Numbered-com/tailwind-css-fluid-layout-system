# Tailwind CSS Fluid Layout System

An unofficial [Tailwind](https://tailwindcss.com/) plugin that eases fluid, responsive layout. It turns a column grid into utilities that scale smoothly with the viewport, and ships a [`px-to-cols`](#pixel--column-conversion) CLI to convert design pixel values into grid spans.

## Installation

Requires **Tailwind CSS v4**.

```bash
bun add -D @numbered/tailwind-fluid-layout-system
# or
pnpm add -D @numbered/tailwind-fluid-layout-system
```

Enable Tailwind's PostCSS plugin:

```js
// postcss.config.js
export default {
  plugins: { '@tailwindcss/postcss': {} },
}
```

The grid is configured in JavaScript — the `theme.grid` object and the plugin options — so load a config file from your CSS entry with `@config`:

```css
/* app.css */
@import 'tailwindcss';
@config './tailwind.config.js';
```

```js
// tailwind.config.js
import fls from '@numbered/tailwind-fluid-layout-system'

export default {
  theme: {
    grid: {
      mobile:  { columns: 10, mockupWidth: 375,  gutter: 10, margin: 20 },
      tablet:  { columns: 10, mockupWidth: 768,  gutter: 10, margin: 30, screen: 'md' },
      desktop: { columns: 12, mockupWidth: 1440, gutter: 20, margin: 60, maxWidth: 1920, fontScalingMaxWidth: 1540, screen: 'lg' },
    },
  },
  plugins: [
    fls({
      color: 'rgba(255,0,0,0.6)',
      guidelines: process.env.NODE_ENV === 'development',
    }),
  ],
}
```

Each breakpoint takes `columns`, `mockupWidth`, plus `gutter` and `margin` in px, and optionally `screen` (a key from `theme.screens`), `maxWidth` and `fontScalingMaxWidth`.

## Motivation

While [CSS grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout) allows to build complex grid systems, [CSS subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Subgrid) is currently not supported on most web browser and cannot be used, thus, nested components cannot inherit parent layout.

This plugins add some utility classes to manage a simple grid system with optional gutters.

👉 [Demo](https://tailwind-fls.numbered.studio)

---

## Documentation

### Grid container

In case you set a max-width to one of your grid layout, you'll need to wrap your content in a `grid-container` class.

```html
<div className='grid-container'>
  [...]
</div>
```

The plugin also provides a `grid-container-full` class that extends the container with negative margins to fill the full width including the grid margins.

```html
<div className='grid-container-full'>
  [...]
</div>
```

### Utility classes

Three prefixes turn any Tailwind spacing or sizing utility into a grid value, written as `{prefix}-{utility}-{size}`:

- **`span-`** — a number of columns, gutters included. Add a `-wide` / `-wider` suffix for one / two extra gutters.
- **`gutter-`** — a number of gutters.
- **`margin-`** — a number of outer grid margins.

```jsx
<div className="span-w-2">2-column span</div>
<div className="span-w-2-wide">2-column span + 1 gutter</div>
<div className="gutter-ml-1">left margin of 1 gutter</div>
<div className="margin-pl-1">left padding of 1 grid margin</div>
```

Sizes can be fractional, written bare or as arbitrary values: `gutter-gap-0.5`, `span-w-6.5`, `span-w-6.5-wide`, `span-w-[0.665]`. Bare sizes go up to the widest grid's column count; use brackets beyond it (`span-w-[16]`).

Every utility below works with all three prefixes:

| Tailwind utility | `span-` (+ `-wide`/`-wider`) | `gutter-` | `margin-` |
| ---------------- | :--------------------------: | :-------: | :-------: |
| **Sizing** — `w` `min-w` `max-w` `h` `min-h` `max-h` | ✓ | ✓ | ✓ |
| **Padding** — `p` `px` `py` `pt` `pr` `pb` `pl` | ✓ | ✓ | ✓ |
| **Margin** — `m` `mx` `my` `mt` `mr` `mb` `ml` | ✓ | ✓ | ✓ |
| **Scroll margin** — `scroll-m` `scroll-mx` `scroll-my` `scroll-mt` `scroll-mr` `scroll-mb` `scroll-ml` | ✓ | ✓ | ✓ |
| **Scroll padding** — `scroll-p` `scroll-px` `scroll-py` `scroll-pt` `scroll-pr` `scroll-pb` `scroll-pl` | ✓ | ✓ | ✓ |
| **Position / inset** — `inset` `inset-x` `inset-y` `top` `right` `bottom` `left` | ✓ | ✓ | ✓ |
| **Gap** — `gap` `gap-x` `gap-y` | ✓ | ✓ | ✓ |
| **Border width** — `border` `border-t` `border-r` `border-b` `border-l` `border-x` `border-y` | ✓ | ✓ | ✓ |
| **Text indent** — `indent` | ✓ | ✓ | ✓ |

### Example Usage

Here are some examples of the plugin classes used in the demo:

```jsx
// Grid container to wrap content
<article className='grid-container py-10'>

  // Content spanning 8 columns at large breakpoint with 2-column offset including a gutter
  <div className='lg:span-w-8 lg:span-ml-2-wide'>
    Content here
  </div>

  // Fixed element with padding based on grid margin
  <div className='fixed margin-pl-1'>
    Fixed content
  </div>

</article>
```

All plugin utilities support Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`).

#### Scrollbar Width

Grid calculations use the `--sbw` CSS variable to account for scrollbar width. Unfortunately, dynamically determining this value in CSS alone is not reliable in 2025. By default, `--sbw` is set to 17px for desktop environments (`@media (pointer: fine)`), regardless of whether a scrollbar is actually visible. Set the `scrollbarWidth` option (e.g. `'0px'` when your audience uses overlay scrollbars, as on macOS), or set `--sbw` programmatically using JavaScript for exact results.

### Plugin Options

| Option | Type | Description |
| ------ | ---- | ----------- |
| `color` | `string` | Color for the grid guidelines overlay |
| `guidelines` | `boolean` | Enable/disable guidelines (defaults to `true` in development) |
| `guidelinesSelector` | `string` | CSS selector for the guidelines container (defaults to `'body'`) |
| `fluidUnit` | `function` | Custom function to compute fluid CSS units |
| `scrollbarWidth` | `string` | `--sbw` value on fine pointers (defaults to `'17px'`) |

#### Guidelines Selector

By default, the grid overlay is rendered using `body::after`. You can change this to target a different element:

```js
fls({
  guidelines: true,
  guidelinesSelector: '.grid-container'  // Use a custom container
})
```

#### Custom Fluid Unit

By default, the plugin uses `vw` units for fluid calculations. You can provide a custom `fluidUnit` function to use different units (e.g., `cqw` for container queries):

```js
import fls from '@numbered/tailwind-fluid-layout-system'

export default {
  plugins: [
    fls({
      // Use container query width units instead of viewport width
      fluidUnit: value => `${value.toPrecision(6)}cqw`
    })
  ]
}
```

The function receives a numeric value (the fluid percentage) and should return a CSS value string with the unit. The default implementation is:

```js
const defaultFluidUnit = value => `${value.toPrecision(6)}vw`
```

You can also import the default function if needed:

```js
import { defaultFluidUnit } from '@numbered/tailwind-fluid-layout-system'
```

---

## Pixel → column conversion

When implementing a design, convert a measured pixel width into the closest grid span class with the bundled `px-to-cols` CLI. Run it with `bunx` — it uses the local install when the package is a dependency, or fetches it on the fly:

```bash
bunx px-to-cols 330 --columns 24 --mockup 1440 --gutter 24 --margin 24
# → span-w-6 (330px, exact)

bunx px-to-cols 250 --columns 24 --mockup 1440 --gutter 24 --margin 24
# → span-w-4-wider (260px, +10px)
```

| Argument    | Default | Description                                                                |
| ----------- | ------- | -------------------------------------------------------------------------- |
| `<pixels>`  | —       | The pixel value to convert (positional)                                    |
| `--columns` | `24`    | Number of grid columns                                                     |
| `--mockup`  | `1440`  | Mockup width in px                                                         |
| `--gutter`  | `24`    | Gutter size in px                                                          |
| `--margin`  | `24`    | Outer margin in px                                                         |
| `--json`    | —       | Output the full JSON result                                               |
| `--batch`   | —       | Read a JSON array from stdin, write a JSON array (one process, many values) |

Values smaller than one column resolve to a `gutter-gap-*` multiple instead of `span-w-*`.

With `--json` you get the full result, including the resolved grid config:

```json
{
  "className": "span-w-6",
  "columns": 6,
  "actualWidth": 330,
  "pixelDifference": 0,
  "gridConfig": { "columns": 24, "mockupWidth": 1440, "gutter": 24, "margin": 24, "columnWidth": 35, "contentWidth": 1392 }
}
```

To convert many values at once (e.g. from a script), pipe a JSON array to `--batch` — it runs the converter in a single process:

```bash
echo '[{"pixels":330,"columns":24,"mockupWidth":1440,"gutter":24,"margin":24}]' | bunx px-to-cols --batch
```

## Programmatic API

The grid math is exported as well. Import the dependency-free helpers from the `/grid-math` subpath (no Tailwind required) — handy for build scripts and tooling:

```js
import { pixelsToColumns, span, gutter, margin } from '@numbered/tailwind-fluid-layout-system/grid-math'

// pixels → closest span (inverse of span())
pixelsToColumns(330, { columns: 24, mockupWidth: 1440, gutter: 24, margin: 24 })
// → { className: 'span-w-6', columns: 6, actualWidth: 330, pixelDifference: 0, gridConfig: { … } }

// columns → pixels
span(6, { columns: 24, mockupWidth: 1440, gutter: 24, margin: 24 }) // → 330
```

`span`, `gutter`, `margin`, `pixelsToColumns` and `defaultFluidUnit` are also re-exported from the package root, alongside the default plugin export.