# Options

Pass them to the plugin: `fls({ color: 'blue' })`.

| Option | Default | Description |
| ------ | ------- | ----------- |
| `guidelines` | `true` in development | Column overlay (drawn from the `mobile` grid up) |
| `color` | `'red'` | Overlay color |
| `guidelinesSelector` | `'body'` | Element whose `::after` draws the overlay |
| `scrollbarWidth` | `'17px'` | `--sbw` on fine pointers, subtracted from fluid values. `'0px'` for overlay scrollbars |
| `fluidUnit` | `v => \`${v.toPrecision(6)}vw\`` | Unit function, e.g. `cqw` for container queries (default exported as `defaultFluidUnit`) |

## Scrollbar width

`vw` includes the vertical scrollbar, so every fluid value subtracts its share of `--sbw`. The plugin sets it on `html`: `0px` by default, `scrollbarWidth` (`17px`) on fine pointers, where scrollbars usually take up space. For an exact value, override the variable at runtime:

```js
const sbw = window.innerWidth - document.documentElement.clientWidth
document.documentElement.style.setProperty('--sbw', `${sbw}px`)
```

Run it on load and on resize to follow scrollbars that appear or disappear.
