# Tailwind CSS Fluid Layout System

![Fluid Layout System: a fluid grid system that scales with the viewport, with span, gutter and offset utilities](docs/hero.jpg)

A [Tailwind CSS v4](https://tailwindcss.com/) plugin that turns your design grid into fluid utilities, plus a `px-to-cols` CLI to translate mockup pixels into grid classes. 👉 [Demo](https://tailwind-fls.numbered.studio)

## Why not CSS subgrid?

Subgrid can pass the page grid down, but only if every wrapper in between is itself a subgrid. One flex row, block wrapper or positioned box breaks the chain, and each component has to opt in. These utilities resolve to viewport units rather than percentages of the parent, so `span-w-2` has the same width at any nesting depth, whatever the parents are.

## Setup

```bash
bun add -D @numbered/tailwind-fluid-layout-system
```

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
  plugins: [fls()],
}
```

| Grid key | Description |
| -------- | ----------- |
| `columns`, `mockupWidth` | Required. Column count and design frame width (px) |
| `gutter`, `margin` | px (a `gutter` below `1` is a fraction of `gridWidth / columns`) |
| `screen` | `theme.screens` key the grid applies from |
| `maxWidth` | px width where the grid stops scaling (wrap content in `.grid-container`) |
| `fontScalingMaxWidth` | px width where the fluid root font size stops scaling (defaults to `maxWidth`) |

Each grid sets fluid `--column`, `--gutter`, `--margin` and `--grid-width` variables at its breakpoint.

## Utilities

`{prefix}-{utility}-{size}`, where the prefix sets the unit:

- **`span-`**: columns, gutters in between included. `-wide` / `-wider` add one / two gutters.
- **`gutter-`**: gutters.
- **`margin-`**: outer grid margins.

```html
<article class="grid-container">
  <div class="span-w-4 lg:span-w-8 lg:span-ml-2-wide gutter-gap-0.5 margin-pl-1">…</div>
</article>
```

- Utilities: `w` `h` `min-*` `max-*`, `p*`, `m*`, `scroll-m*`, `scroll-p*`, `inset*` `top` `right` `bottom` `left`, `gap*`, `border*`, `indent`.
- Sizes: bare up to the widest grid's column count, fractional allowed (`span-w-6.5`), arbitrary beyond (`span-w-[16]`), negatable (`-span-ml-1`).
- `.grid-container` centers content capped at `maxWidth`. `.grid-container-full` extends a container over the grid margins.

## Options

| Option | Default | Description |
| ------ | ------- | ----------- |
| `guidelines` | `true` in development | Column overlay (drawn from the `mobile` grid up) |
| `color` | `'red'` | Overlay color |
| `guidelinesSelector` | `'body'` | Element whose `::after` draws the overlay |
| `scrollbarWidth` | `'17px'` | `--sbw` on fine pointers, subtracted from fluid values. `'0px'` for overlay scrollbars |
| `fluidUnit` | `v => \`${v.toPrecision(6)}vw\`` | Unit function, e.g. `cqw` for container queries (default exported as `defaultFluidUnit`) |

## px → columns

Converts a mockup measurement into the closest class. Pass your grid's values (defaults: `24 / 1440 / 24 / 24`):

```bash
bunx px-to-cols 250 --columns 24 --mockup 1440 --gutter 24 --margin 24
# → span-w-4-wider (260px, +10px)
```

Spacing up to one gutter resolves to `gutter-gap-0.5` / `gutter-gap-1`, anything wider to a span. `--json` prints the full result, and `--batch` reads a JSON array of `{ pixels, columns, mockupWidth, gutter, margin }` from stdin.

The same math is available in JS, without Tailwind:

```js
import { pixelsToColumns, span, gutter, margin } from '@numbered/tailwind-fluid-layout-system/grid-math'

const grid = { columns: 24, mockupWidth: 1440, gutter: 24, margin: 24 }
pixelsToColumns(330, grid) // → { className: 'span-w-6', actualWidth: 330, pixelDifference: 0, … }
span(6, grid)              // → 330 (px)
span(6)                    // → 'calc(6 * var(--column) + 5 * var(--gutter))'
```
