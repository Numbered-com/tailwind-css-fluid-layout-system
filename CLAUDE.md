# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@numbered/tailwind-fluid-layout-system`, a Tailwind CSS plugin that provides fluid, responsive layout utilities based on a configurable grid system. It generates CSS custom properties (`--column`, `--gutter`, `--margin`, `--grid-width`) that scale fluidly with viewport width.

## Commands

```bash
# Development (runs Next.js demo app)
npm run dev

# Build demo
npm run build

# Run tests
npx jest

# Publish (patch/minor/major version bump + npm publish)
npm run patch
npm run minor
npm run major
```

## Architecture

### Plugin Source (`src/index.js`)

The entire plugin is a single file exporting a Tailwind plugin created with `plugin.withOptions()`. Key concepts:

- **Grid Configuration**: Defined in `theme.grid` with breakpoints (mobile, tablet, desktop). Each grid specifies `columns`, `gutter`, `margin`, `mockupWidth`, and optional `maxWidth`/`fontScalingMaxWidth`
- **CSS Variables**: Plugin generates `--column`, `--gutter`, `--margin`, `--grid-width`, `--sbw` (scrollbar width) on `:root`
- **Utility Functions**: `span()`, `gutter()`, `margin()` calculate fluid values using CSS `calc()` expressions

### Generated Utility Classes

Three utility prefixes that work with all Tailwind spacing/sizing utilities (w, h, p, m, gap, inset, etc.):

- `span-{utility}-{n}[-wide|-wider]` - Size based on n columns (optionally +1 or +2 gutters)
- `gutter-{utility}-{n}` - Size based on n gutters
- `margin-{utility}-{n}` - Size based on n grid margins

Container classes: `grid-container`, `grid-container-full`

### Demo App (`demo/`)

Next.js app used for development and documentation. Uses MDX for content rendering.

## Grid Configuration

Gutter can be specified as:
- Pixel value (e.g., `gutter: 10`) - absolute pixels
- Ratio (e.g., `gutter: 0.1`) - fraction of total grid width divided by columns

The `screen` property links a grid config to a Tailwind breakpoint for responsive behavior.
