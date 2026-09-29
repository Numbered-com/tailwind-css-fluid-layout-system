---
name: fluid-layout
description: Use when building UI from designs/Figma/mockups in a project using @numbered/tailwind-fluid-layout-system, or converting mockup px to span-/gutter-/margin- grid classes or spacing classes.
---

Every mockup px goes through the `px-to-cols` CLI: it _snaps_ a measurement to the closest grid class, or writes it as an exact spacing class when it is off-grid. Classes come from the CLI, never from mental arithmetic.

## Steps

1. **Load the grids.** Read `theme.grid` (or `theme.extend.grid`, merged over the plugin's default `mobile`/`tablet`/`desktop` grids) in the JS Tailwind config (the file the CSS loads via `@config`; it may import a separate file). With neither, those defaults apply: `mobile` 10/375/10/20, `tablet` 10/768/10/30 on `md`, `desktop` 12/1440/10/60 on `lg`. Each key is one breakpoint grid: `columns`, `mockupWidth`, `gutter`, `margin`, `screen`. Pass `gutter` as written; a value below `1` is a ratio the CLI resolves itself. A missing `gutter` or `margin` is `0`.
2. **Load the spacing step.** Read `--spacing` in the CSS `@theme`: `spacing` is its value in px at 16px per rem (`calc(1rem / 16)` → `1`, Tailwind's default `0.25rem` → `4`). Done when every grid's four values and `spacing` are in hand: the CLI defaults (`24/1440/24/24`, spacing `4`) are someone else's project, so every call carries all five.
3. **Measure each frame against its grid.** Match each design frame to the grid whose `mockupWidth` equals the frame width. Collect every measurement: horizontal widths, offsets, padding and column gaps go against the grid; vertical spacing and type sizes get `"grid": false`.
4. **Convert in one batch.** Pipe all measurements, across all grids, into a single call:

   ```bash
   echo '[{"pixels":330,"columns":12,"mockupWidth":1440,"gutter":20,"margin":60,"spacing":4}, {"pixels":18,"spacing":4,"grid":false}, …]' | bunx @numbered/tailwind-fluid-layout-system --batch
   ```

   A grid result with `snapped: true` is a grid class (`pixelDifference` is how far the snap landed from the design); `snapped: false` means the value sits beyond a quarter gutter from any grid class, so `className` is a spacing class for the exact px. A `grid: false` result is `{ className, rem }`.
5. **Write the classes.** The CLI answers with `span-w-*`, `gutter-gap-*` or `gap-*`; keep the size and swap the utility for the property measured: `span-w-4-wide` as a left offset → `span-ml-4-wide`, `gutter-gap-1` as inline padding → `gutter-px-1`, `gap-3.25` as top margin → `mt-3.25`. Type sizes use `rem`: `text-[1.125rem]`. A measurement equal to the grid's `margin` is `margin-*-1`: the CLI never returns `margin-` classes. The grid without a `screen` (`mobile`, required) is unprefixed; each other grid gets its `screen` prefix (`lg:span-w-8`), omitted when it repeats the class below it. Never write `[Npx]` arbitrary values: they don't scale with the fluid root font size.

Done when every measurement on every frame is a class from the CLI.

## Reference

### Utilities

`{span|gutter|margin}-{utility}-{size}`: `span` counts columns (inner gutters included, `-wide`/`-wider` add one/two gutters), `gutter` counts gutters, `margin` counts outer margins. Utilities: `w` `h` `min-*` `max-*` `p*` `m*` `scroll-m*` `scroll-p*` `inset*` `top` `right` `bottom` `left` `gap*` `border*` `indent`. Sizes may be fractional (`span-w-6.5`), negative (`-span-ml-1`), or arbitrary beyond the widest grid (`span-w-[16]`).

`.grid-container` centers a page section capped at the grid's `maxWidth`; `.grid-container-full` extends a container over the margins. Grid classes resolve to viewport units (unless the plugin's `fluidUnit` option changes them), so they hold at any nesting depth: offset nested levels by whole columns without subgrid.
