# px → columns

Converts a mockup measurement into the closest class. Pass your grid's values (defaults: `24 / 1440 / 24 / 24`) and `--spacing`, the px per `--spacing` step at the mockup width (default `4` for Tailwind's `0.25rem`; `1` for `calc(1rem / 16)`):

```bash
bunx @numbered/tailwind-fluid-layout-system 330 --columns 24 --mockup 1440 --gutter 24 --margin 24 --spacing 4
# → span-w-6 (330px, exact)
```

Spacing up to one gutter resolves to `gutter-gap-0.5` / `gutter-gap-1`, anything wider to a span. A value more than a quarter gutter from its closest class is off-grid: it becomes a spacing class for the exact px (`gap-3.25`, or `gap-[0.84375rem]` off the 0.25-step scale; the plugin makes `1rem` = 16 mockup px). `--no-grid` skips the grid and returns only the spacing class and the rem value, for vertical spacing and type sizes (`text-[1.125rem]`). `--json` prints the full result (`snapped: false` marks off-grid), and `--batch` reads a JSON array of `{ pixels, columns, mockupWidth, gutter, margin, spacing, grid }` from stdin (`grid: false` works like `--no-grid`, returning `{ className, rem }`).

## JS API

The same math is available in JS, without Tailwind:

```js
import { pixelsToColumns, spacingClass, span, gutter, margin } from '@numbered/tailwind-fluid-layout-system/grid-math'

const grid = { columns: 24, mockupWidth: 1440, gutter: 24, margin: 24 }
pixelsToColumns(330, grid) // → { className: 'span-w-6', snapped: true, actualWidth: 330, pixelDifference: 0, … }
pixelsToColumns(13, grid)  // → { className: 'gap-3.25', snapped: false, … } (3rd arg: px per spacing step, default 4)
spacingClass(18, 1)        // → 'gap-18'
span(6, grid)              // → 330 (px)
span(6)                    // → 'calc(6 * var(--column) + 5 * var(--gutter))'
```
