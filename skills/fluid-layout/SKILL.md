---
name: fluid-layout
description: Use when building UI from Figma or mockups in a project using @numbered/tailwind-fluid-layout-system, or converting mockup px to span-/gutter-/margin- grid classes.
---

The `px-to-cols` CLI resolves horizontal measurements to grid classes: it _snaps_ a measurement to the closest grid class, or writes it as an exact spacing class when it is off-grid.

## Steps

1. **Load the grids.** Read `theme.grid` or `theme.extend.grid` in the JS Tailwind config (the file the CSS loads via `@config`; it may import a separate file); `theme.extend.grid` merges over the grids in the installed plugin's source. With neither key, stop and tell the user the project has no grid config. Each key is one breakpoint grid: `columns`, `mockupWidth`, `gutter`, `margin`, `screen`. Pass `gutter` as written. A missing `gutter` or `margin` is `0`.
2. **Load the spacing step.** Read `--spacing` in the CSS `@theme`: `spacing` is its value in px at 16px per rem (`calc(1rem / 16)` → `1`, `0.25rem` → `4`). Done when every grid's four values and `spacing` are in hand; every CLI call carries all five.
3. **Measure each frame against its grid.** Match each design frame to the grid whose `mockupWidth` equals the frame width. Collect its horizontal measurements: widths, offsets, padding and column gaps. Vertical spacing and font sizes skip the CLI: their class size is px ÷ `spacing` (`mt-24`, `text-10` at `spacing` `1`).
4. **Convert in one batch.** Pipe all horizontal measurements, across all grids, into a single call:

   ```bash
   echo '[{"pixels":330,"columns":12,"mockupWidth":1440,"gutter":20,"margin":60,"spacing":1}, …]' | bunx @numbered/tailwind-fluid-layout-system --batch
   ```
5. **Write the classes.** Keep each `className`'s size and swap its utility for the property you measured: `span-w-4` as a left offset → `span-ml-4`, off-grid `gap-40` as left padding → `pl-40`. Padding or offset equal to the grid's `margin` is `margin-px-1` / `margin-ml-1`. Classes for the `mobile` grid (required, no `screen`) are unprefixed; other grids get their `screen` prefix (`lg:span-w-8`), skipped when the class equals the one from the next smaller grid.

Done when every horizontal measurement on every frame is a class from the CLI.

## Reference

### Utilities

`{span|gutter|margin}-{utility}-{size}`: `span` counts columns (inner gutters included, `-wide`/`-wider` add one/two gutters), `gutter` counts gutters, `margin` counts outer margins. Utilities: `w` `h` `min-*` `max-*` `p*` `m*` `scroll-m*` `scroll-p*` `inset*` `top` `right` `bottom` `left` `gap*` `border*` `indent`. Sizes may be fractional (`span-w-6.5`), negative (`-span-ml-1`), or arbitrary beyond the widest grid (`span-w-[16]`).

`.grid-container` centers a page section capped at the grid's `maxWidth`; `.grid-container-full` extends a container over the margins. Grid classes resolve to viewport units, so they hold at any nesting depth: offset nested levels by whole columns without subgrid.
