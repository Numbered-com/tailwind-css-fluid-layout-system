# Tailwind CSS Fluid Layout System

An unofficial [Tailwind](https://tailwindcss.com/) plugin attempting to ease fluid layout implementation.


## Motivation

While [CSS grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout) allows to build complex grid systems, [CSS subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout/Subgrid) is currently not supported on most web browser and cannot be used, thus, nested components cannot inherit parent layout.

This plugins add some utility classes to manage a simple grid system with optional gutters.


## How it works

// TODO

---

## Documentation

### Setup

// TODO

### Components

### Grid container

In case you set a max-width to one of your grid layout, you'll need to wrap your content in a `grid-container` class.

```html
<div className='grid-container'>
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
| span-w-min-{size}-{?wide\|wider}
| span-w-max-{size}-{?wide\|wider}
| span-h-{size}-{?wide\|wider}
| span-h-min-{size}-{?wide\|wider}
| span-h-max-{size}-{?wide\|wider}
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

#### Gutter

A `gutter` defines a number of columns. It can be called with any Tailwind spacing or sizing utility: `gutter-{spacing|sizing}-{size}`

```jsx
<div className="gutter-ml-1">A margin left of 1 gutter</div>
```

Available utilities:

| Class
| ---------------------------------
| gutter-w-{size}
| gutter-w-min-{size}
| gutter-w-max-{size}
| gutter-h-{size}
| gutter-h-min-{size}
| gutter-h-max-{size}
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

#### Margin

A `margin` defines the outter grid margin number of columns. It can be called with any Tailwind spacing or sizing utility: `span-{spacing|sizing}-{size}`

```jsx
<div className="margin-pl-1">A padding left of 1 grid margin</div>
```

Available utilities:

| Class
| ---------------------------------
| margin-w-{size}
| margin-w-min-{size}
| margin-w-max-{size}
| margin-h-{size}
| margin-h-min-{size}
| margin-h-max-{size}
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