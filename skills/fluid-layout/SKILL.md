---
name: fluid-layout
description: Use when building UI from designs/Figma/mockups in a project using @numbered/tailwind-fluid-layout-system, or converting mockup px to span-/gutter-/margin- grid classes.
---

Horizontal layout from a design always goes through the `px-to-cols` CLI: it _snaps_ a mockup measurement to the closest grid class. Grid classes come from the CLI, never from mental arithmetic.

## Steps

1. **Load the grids.** Read `theme.grid` in the Tailwind config (it may import a separate file). Each key is one breakpoint grid: `columns`, `mockupWidth`, `gutter`, `margin`, `screen`. Pass `gutter` as written; a value below `1` is a ratio the CLI resolves itself. Done when every grid's four values are in hand — the CLI defaults (`24/1440/24/24`) are someone else's grid, so every call carries all four.
2. **Measure each frame against its grid.** Match each design frame to the grid whose `mockupWidth` equals the frame width. Collect every horizontal measurement: widths, horizontal offsets, horizontal padding, column gaps. Vertical spacing and type sizes stay out of the batch (see step 5).
3. **Convert in one batch.** Pipe all measurements, across all grids, into a single call:

   ```bash
   echo '[{"pixels":250,"columns":12,"mockupWidth":1440,"gutter":20,"margin":60}, …]' | bunx px-to-cols --batch
   ```

   Each result's `className` carries the size; `pixelDifference` is how far the snap landed from the design.
4. **Judge the snap.** Within a quarter gutter (`gridConfig.gutter / 4`), the measurement is on-grid: keep the class. Beyond it, the measurement is off-grid: use a Tailwind spacing class from the mockup px (see [Spacing](#spacing)). A measurement equal to the grid's `margin` is `margin-*-1` — the CLI only returns `span-` and `gutter-` classes.
5. **Write the classes.** The CLI always answers with `w` or `gap`; keep the size and swap the utility for the property measured: `span-w-4-wide` as a left offset → `span-ml-4-wide`, `gutter-gap-1` as inline padding → `gutter-px-1`. The first (smallest) grid is unprefixed; each larger grid gets its `screen` prefix (`lg:span-w-8`), omitted when it repeats the class below it. Vertical spacing and type use Tailwind spacing/text classes from mockup px — the fluid root font size already scales them.

Done when every horizontal measurement on every frame is either a CLI-snapped class or a deliberate off-grid spacing class.

## Reference

### Utilities

`{span|gutter|margin}-{utility}-{size}` — `span` counts columns (inner gutters included, `-wide`/`-wider` add one/two gutters), `gutter` counts gutters, `margin` counts outer margins. Utilities: `w` `h` `min-*` `max-*` `p*` `m*` `scroll-m*` `scroll-p*` `inset*` `top` `right` `bottom` `left` `gap*` `border*` `indent`. Sizes may be fractional (`span-w-6.5`), negative (`-span-ml-1`), or arbitrary beyond the widest grid (`span-w-[16]`).

`.grid-container` centers a page section capped at the grid's `maxWidth`; `.grid-container-full` extends a container over the margins. Grid classes resolve to viewport units, so they hold at any nesting depth — offset nested levels by whole columns without subgrid.

### Spacing

Check the project's `--spacing` in CSS `@theme`. With `--spacing: calc(1rem / 16)`, mockup px read straight into classes (`ml-12` = 12px). With Tailwind's default `0.25rem`, divide by 4 (`ml-3` = 12px) or use `ml-[0.75rem]`.
