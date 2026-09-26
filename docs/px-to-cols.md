# px → columns

Converts a mockup measurement into the closest class. Pass your grid's values (defaults: `24 / 1440 / 24 / 24`):

```bash
bunx px-to-cols 250 --columns 24 --mockup 1440 --gutter 24 --margin 24
# → span-w-4-wider (260px, +10px)
```

Spacing up to one gutter resolves to `gutter-gap-0.5` / `gutter-gap-1`, anything wider to a span. It only returns grid classes, so it ignores `--spacing` (see [Spacing scale](configuration.md#spacing-scale)). `--json` prints the full result, and `--batch` reads a JSON array of `{ pixels, columns, mockupWidth, gutter, margin }` from stdin.

## JS API

The same math is available in JS, without Tailwind:

```js
import { pixelsToColumns, span, gutter, margin } from '@numbered/tailwind-fluid-layout-system/grid-math'

const grid = { columns: 24, mockupWidth: 1440, gutter: 24, margin: 24 }
pixelsToColumns(330, grid) // → { className: 'span-w-6', actualWidth: 330, pixelDifference: 0, … }
span(6, grid)              // → 330 (px)
span(6)                    // → 'calc(6 * var(--column) + 5 * var(--gutter))'
```
