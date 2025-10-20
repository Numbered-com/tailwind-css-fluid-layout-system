# Tailwind CSS Fluid Layout System

An unofficial [Tailwind](https://tailwindcss.com/) plugin attempting to ease fluid layout implementation.

## Installation

```bash
npm i -D @numbered/tailwind-fluid-layout-system
```

Then import the plugin to your `tailwind.config.js`, add configure it.

```js
const fls = require('@numbered/tailwind-fluid-layout-system')

module.exports = {
  theme: {
    grid: {
      mobile: {
        columns: 10,
        mockupWidth: 375,
        gutter: 10,
        margin: 20
      },
      tablet: {
        columns: 10,
        mockupWidth: 768,
        gutter: 10,
        margin: 30,
        screen: 'md'
      },
      desktop: {
        columns: 12,
        mockupWidth: 1440,
        gutter: 20,
        margin: 60,
        maxWidth: 1920,
        fontScalingMaxWidth: 1540,
        screen: 'lg'
      }
    }
  },
  plugins: [fls({
    color: 'rgba(255,0,0,0.6)',
    enabled: process.env.NODE_ENV === 'development'
  })]
}
```

## Motivation

While [CSS grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout) allows to build complex grid systems, [CSS subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Subgrid) is currently not supported on most web browser and cannot be used, thus, nested components cannot inherit parent layout.

This plugins add some utility classes to manage a simple grid system with optional gutters.

👉 [Demo](https://tailwind-fls.numbered.studio)

---

## Documentation

### Grid container

In case you set a max-width to one of your grid layout, you'll need to wrap your content in a `grid-container` class.

```html
<div className='grid-container'>
  [...]
</div>
```

The plugin also provides a `grid-container-full` class that extends the container with negative margins to fill the full width including the grid margins.

```html
<div className='grid-container-full'>
  [...]
</div>
```

### Utility classes

#### Span

A `span` defines a number of columns. It can be called with any Tailwind spacing or sizing utility: `span-{spacing|sizing}-{size}`.
You can prefix it with `-wide` or `-wider`to respectively add one or two gutters.

```jsx
<div className="span-w-2">A 2 column span</div>
<div className="span-w-2-wide">A 2 column span with 1 gutter</div>
<div className="span-w-2-wider">A 2 column span with 2 gutters</div>
```

Available utilities:

| Class
| ---------------------------------
| span-w-{size}-{?wide\|wider}
| span-min-w-{size}-{?wide\|wider}
| span-max-w-{size}-{?wide\|wider}
| span-h-{size}-{?wide\|wider}
| span-min-h-{size}-{?wide\|wider}
| span-max-h-{size}-{?wide\|wider}
| span-p-{size}-{?wide\|wider}
| span-px-{size}-{?wide\|wider}
| span-py-{size}-{?wide\|wider}
| span-pt-{size}-{?wide\|wider}
| span-pr-{size}-{?wide\|wider}
| span-pb-{size}-{?wide\|wider}
| span-pl-{size}-{?wide\|wider}
| span-m-{size}-{?wide\|wider}
| span-mx-{size}-{?wide\|wider}
| span-my-{size}-{?wide\|wider}
| span-mt-{size}-{?wide\|wider}
| span-mr-{size}-{?wide\|wider}
| span-mb-{size}-{?wide\|wider}
| span-ml-{size}-{?wide\|wider}
| span-scroll-m-{size}-{?wide\|wider}
| span-scroll-mx-{size}-{?wide\|wider}
| span-scroll-my-{size}-{?wide\|wider}
| span-scroll-mt-{size}-{?wide\|wider}
| span-scroll-mr-{size}-{?wide\|wider}
| span-scroll-mb-{size}-{?wide\|wider}
| span-scroll-ml-{size}-{?wide\|wider}
| span-scroll-p-{size}-{?wide\|wider}
| span-scroll-px-{size}-{?wide\|wider}
| span-scroll-py-{size}-{?wide\|wider}
| span-scroll-pt-{size}-{?wide\|wider}
| span-scroll-pr-{size}-{?wide\|wider}
| span-scroll-pb-{size}-{?wide\|wider}
| span-scroll-pl-{size}-{?wide\|wider}
| span-inset-{size}-{?wide\|wider}
| span-inset-x-{size}-{?wide\|wider}
| span-inset-y-{size}-{?wide\|wider}
| span-top-{size}-{?wide\|wider}
| span-right-{size}-{?wide\|wider}
| span-bottom-{size}-{?wide\|wider}
| span-left-{size}-{?wide\|wider}
| span-gap-{size}-{?wide\|wider}
| span-gap-x-{size}-{?wide\|wider}
| span-gap-y-{size}-{?wide\|wider}
| span-indent-{size}-{?wide\|wider}
| span-border-{size}-{?wide\|wider}
| span-border-t-{size}-{?wide\|wider}
| span-border-r-{size}-{?wide\|wider}
| span-border-b-{size}-{?wide\|wider}
| span-border-l-{size}-{?wide\|wider}
| span-border-x-{size}-{?wide\|wider}
| span-border-y-{size}-{?wide\|wider}

#### Gutter

A `gutter` defines a number of columns. It can be called with any Tailwind spacing or sizing utility: `gutter-{spacing|sizing}-{size}`

```jsx
<div className="gutter-ml-1">A margin left of 1 gutter</div>
```

Available utilities:

| Class
| ---------------------------------
| gutter-w-{size}
| gutter-min-w-{size}
| gutter-max-w-{size}
| gutter-h-{size}
| gutter-min-h-{size}
| gutter-max-h-{size}
| gutter-p-{size}
| gutter-px-{size}
| gutter-py-{size}
| gutter-pt-{size}
| gutter-pr-{size}
| gutter-pb-{size}
| gutter-pl-{size}
| gutter-m-{size}
| gutter-mx-{size}
| gutter-my-{size}
| gutter-mt-{size}
| gutter-mr-{size}
| gutter-mb-{size}
| gutter-ml-{size}
| gutter-scroll-m-{size}
| gutter-scroll-mx-{size}
| gutter-scroll-my-{size}
| gutter-scroll-mt-{size}
| gutter-scroll-mr-{size}
| gutter-scroll-mb-{size}
| gutter-scroll-ml-{size}
| gutter-scroll-p-{size}
| gutter-scroll-px-{size}
| gutter-scroll-py-{size}
| gutter-scroll-pt-{size}
| gutter-scroll-pr-{size}
| gutter-scroll-pb-{size}
| gutter-scroll-pl-{size}
| gutter-inset-{size}
| gutter-inset-x-{size}
| gutter-inset-y-{size}
| gutter-top-{size}
| gutter-right-{size}
| gutter-bottom-{size}
| gutter-left-{size}
| gutter-gap-{size}
| gutter-gap-x-{size}
| gutter-gap-y-{size}
| gutter-indent-{size}
| gutter-border-{size}
| gutter-border-t-{size}
| gutter-border-r-{size}
| gutter-border-b-{size}
| gutter-border-l-{size}
| gutter-border-x-{size}
| gutter-border-y-{size}

#### Margin

A `margin` defines the outter grid margin number of columns. It can be called with any Tailwind spacing or sizing utility: `span-{spacing|sizing}-{size}`

```jsx
<div className="margin-pl-1">A padding left of 1 grid margin</div>
```

Available utilities:

| Class
| ---------------------------------
| margin-w-{size}
| margin-min-w-{size}
| margin-max-w-{size}
| margin-h-{size}
| margin-min-h-{size}
| margin-max-h-{size}
| margin-p-{size}
| margin-px-{size}
| margin-py-{size}
| margin-pt-{size}
| margin-pr-{size}
| margin-pb-{size}
| margin-pl-{size}
| margin-m-{size}
| margin-mx-{size}
| margin-my-{size}
| margin-mt-{size}
| margin-mr-{size}
| margin-mb-{size}
| margin-ml-{size}
| margin-scroll-m-{size}
| margin-scroll-mx-{size}
| margin-scroll-my-{size}
| margin-scroll-mt-{size}
| margin-scroll-mr-{size}
| margin-scroll-mb-{size}
| margin-scroll-ml-{size}
| margin-scroll-p-{size}
| margin-scroll-px-{size}
| margin-scroll-py-{size}
| margin-scroll-pt-{size}
| margin-scroll-pr-{size}
| margin-scroll-pb-{size}
| margin-scroll-pl-{size}
| margin-inset-{size}
| margin-inset-x-{size}
| margin-inset-y-{size}
| margin-top-{size}
| margin-right-{size}
| margin-bottom-{size}
| margin-left-{size}
| margin-gap-{size}
| margin-gap-x-{size}
| margin-gap-y-{size}
| margin-indent-{size}
| margin-border-{size}
| margin-border-t-{size}
| margin-border-r-{size}
| margin-border-b-{size}
| margin-border-l-{size}
| margin-border-x-{size}
| margin-border-y-{size}

### Example Usage

Here are some examples of the plugin classes used in the demo:

```jsx
// Grid container to wrap content
<article className='grid-container py-10'>

  // Content spanning 8 columns at large breakpoint with 2-column offset including a gutter
  <div className='lg:span-w-8 lg:span-ml-2-wide'>
    Content here
  </div>

  // Fixed element with padding based on grid margin
  <div className='fixed margin-pl-1'>
    Fixed content
  </div>

</article>
```

All plugin utilities support Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`).

#### Scrollbar Width

Grid calculations use the `--sbw` CSS variable to account for scrollbar width. Unfortunately, dynamically determining this value in CSS alone is not reliable in 2025. By default, `--sbw` is set to 17px for desktop environments (`@media (pointer: fine)`), regardless of whether a scrollbar is actually visible. For more accurate results, you can set this value programmatically using JavaScript.