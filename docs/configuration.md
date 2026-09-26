# Configuration

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

## Spacing scale

The plugin sets a fluid root font size (`1rem` = 16px at `mockupWidth`) but leaves Tailwind's `--spacing` untouched. With the default `0.25rem`, `ml-12` is 48px on the mockup, not 12px. To read mockup pixels straight into spacing classes, set it yourself:

```css
@theme {
  --spacing: calc(1rem / 16); /* ml-12 = 12px at mockupWidth */
}
```

Grid utilities (`span-`, `gutter-`, `margin-`) and `px-to-cols` don't depend on `--spacing`, so they're the same with either setting.
