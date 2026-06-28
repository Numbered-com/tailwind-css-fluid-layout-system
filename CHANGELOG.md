# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
