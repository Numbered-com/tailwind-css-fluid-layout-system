# Utilities

`{prefix}-{utility}-{size}`, where the prefix sets the unit:

- **`span-`**: columns, gutters in between included. `-wide` / `-wider` add one / two gutters.
- **`gutter-`**: gutters.
- **`margin-`**: outer grid margins.

```html
<article class="grid-container">
  <div class="span-w-4 lg:span-w-8 lg:span-ml-2-wide gutter-gap-0.5 margin-pl-1">…</div>
</article>
```

- Utilities: `w` `h` `min-*` `max-*`, `p*`, `m*`, `scroll-m*`, `scroll-p*`, `inset*` `top` `right` `bottom` `left`, `gap*`, `border*`, `indent`.
- Sizes: bare up to the widest grid's column count, fractional allowed (`span-w-6.5`), arbitrary beyond (`span-w-[16]`), negatable (`-span-ml-1`).
- `.grid-container` centers content capped at `maxWidth`. `.grid-container-full` extends a container over the grid margins.
