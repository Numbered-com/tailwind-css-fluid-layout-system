# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `px-to-cols --spacing N` (px per `--spacing` step: `4` for `0.25rem`, `1` for `calc(1rem / 16)`) and `--no-grid`, which returns only the spacing class and rem value for vertical spacing and type sizes. Batch items take `spacing` and `grid: false`.
- `spacingClass(px, spacing)` and `rem(px)` exports from `grid-math`.

### Changed

- `pixelsToColumns` / `px-to-cols` return a spacing class (`gap-3.25`, or `gap-[0.84375rem]` off the 0.25-step scale) with `snapped: false` when a value is more than a quarter gutter from its closest grid class; grid results carry `snapped: true`.

## [1.1.1] - 2026-09-26

## [1.1.0] - 2026-09-26

### Added

- `scrollbarWidth` option to set `--sbw` on fine pointers (defaults to `17px`; use `0px` for overlay scrollbars).
- `metrics(grid)` and `spreadings` exports from `grid-math`: pixel grid width, gutter and column; the gutters each `wide`/`wider` adds.
- Bare fractional values: `gutter-gap-0.5`, `span-w-6.5`, `span-w-6.5-wide` work like their bracketed forms, up to the widest grid's column count.

### Changed

- Fractional spans now include the gutter before their partial column: `span-w-[6.5]` is `6.5 * var(--column) + 6 * var(--gutter)` and ends mid-column 7 (previously `+ 5.5`, half a gutter short). Whole spans are unchanged.
- Source migrated to TypeScript; the package now ships compiled `dist/` JS with `.d.ts` typings (built by `tsc` on `prepublishOnly`). Exported types: `Grid`, `PixelsToColumnsResult`.
- `span()`, `gutter()` and `margin()` throw on invalid instructions (`span("foo")`, `gutter("2 wide")`) instead of returning `calc(NaN …)`.
- Guideline overlay SVG positions are rounded to 6 significant digits, shrinking the generated CSS.
- `pixelsToColumns` / `px-to-cols` pick from spans plus `gutter-gap-0.5`/`gutter-gap-1` in one pool: values near a column no longer snap to gutter multiples (`34px` → `span-w-1`, not `gutter-gap-1.5`), and wide values always align to columns.

### Fixed

- Invalid arbitrary values (`span-w-[foo]`, `margin-w-[1px]`, `span-w-[3_widest]`, `gutter-w-[2_wide]`) no longer emit broken `calc()` CSS; they produce no utility.
- Grids with `maxWidth` no longer jump by the scrollbar compensation at the breakpoint: variables are capped with `min()` instead of a separate media query.
- Hex guideline colours (`#ff0000`) are URL-encoded, so the overlay's data URL no longer truncates.
- The guidelines' `visibility` fallback is a valid `inherit` instead of the string `"inherit"`.
- The plugin no longer mutates the theme's grid config; `gutter(n, grid)` returns px for ratio gutters too.
- An unknown `screen` key throws instead of emitting `@media undefined`.
- A custom `fluidUnit` now also applies to the fluid font size.
- `--sbw` is declared once instead of once per grid.
- `px-to-cols --batch` rejects items without a positive `pixels` value.
- Grids on `{ raw }` or array screens get their real media query instead of `@media ()`.

### Removed

- Commented-out experiments in the base styles.

## [1.0.0] - 2026-06-28

### Added

- Negative grid utilities via Tailwind's `supportsNegativeValues`, so `-span-ml-3`, `-gutter-gap-2`, `-margin-mt-1`, etc. now generate (with `-wide`/`-wider` variants).

### Changed

- **Tailwind CSS v4 is now required** (`peerDependencies: tailwindcss >= 4.0.0`).
- Demo migrated to Tailwind v4 + Next.js 16: `@tailwindcss/postcss`, a CSS entry using `@import "tailwindcss"` + `@config`, and native MDX source scanning.
- Utility values are precomputed into finished `calc()` strings so v4's value negation wraps a valid expression instead of feeding the math helpers an unparseable string.

### Removed

- Unused runtime dependencies (`lodash.*`, `@mdx-js/react`) — the published package now ships with no dependencies.
- Dead dev tooling and config (`autoprefixer`, `highlight.js`, broken `jest` setup), the `dist/` files entry, and the obsolete `next export` script.

## [0.1.0] - 2022-07-28

### Added

- Everything
