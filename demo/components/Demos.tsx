import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { span, gutter, margin } from '../../src/grid-math.js'
import grids, { type Grid } from '../grid'

const screens: Record<string, number> = { md: 768, lg: 1024 }
const fmt = (n: number) => `${n.toFixed(1)}px`

const Frame = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className='not-prose my-10'>
    <p className='mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted'>{title}</p>
    {children}
  </div>
)

const Stats = ({ items }: { items: [string, string][] }) => (
  <dl className='grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-xs md:grid-cols-4'>
    {items.map(([label, value]) => (
      <div key={label}>
        <dt className='text-muted'>{label}</dt>
        <dd className='mt-1 text-paper tabular-nums'>{value}</dd>
      </div>
    ))}
  </dl>
)

const activeGrid = (width: number) =>
  Object.entries(grids).reduce((active, entry) =>
    !entry[1].screen || width >= screens[entry[1].screen] ? entry : active
  )

// Mirrors the plugin math: every value is a mockup px value scaled by width / mockupWidth.
const resolve = (g: Grid, width: number) => {
  const scale = width / g.mockupWidth
  const inner = g.mockupWidth - 2 * g.margin
  const gut = g.gutter < 1 ? (inner * g.gutter) / g.columns : g.gutter
  const col = (inner - (g.columns - 1) * gut) / g.columns
  const fontWidth = Math.min(width, g.fontScalingMaxWidth || g.maxWidth || Infinity)
  return { scale, gut, col, root: (16 * fontWidth) / g.mockupWidth }
}

export function LiveReadout() {
  const probe = useRef<HTMLDivElement>(null)
  const [stats, setStats] = useState<{ viewport: number; name: string; col: number; gut: number; mar: number; gw: number; root: number } | null>(null)

  useEffect(() => {
    const measure = () => {
      const [col, gut, mar, gw] = [...probe.current!.children].map(el => el.getBoundingClientRect().width)
      setStats({
        viewport: window.innerWidth,
        name: activeGrid(window.innerWidth)[0],
        col,
        gut,
        mar,
        gw,
        root: parseFloat(getComputedStyle(document.documentElement).fontSize)
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  return (
    <Frame title='Live values · resize the window'>
      <div ref={probe} aria-hidden='true' className='absolute invisible'>
        <div style={{ width: 'var(--column)' }} />
        <div style={{ width: 'var(--gutter)' }} />
        <div style={{ width: 'var(--margin)' }} />
        <div style={{ width: 'var(--grid-width)' }} />
      </div>
      {stats && (
        <Stats
          items={[
            ['grid', `${stats.name} · ${stats.viewport}px`],
            ['--grid-width', fmt(stats.gw)],
            ['--column', fmt(stats.col)],
            ['--gutter', fmt(stats.gut)],
            ['--margin', fmt(stats.mar)],
            ['1rem', fmt(stats.root)]
          ]}
        />
      )}
    </Frame>
  )
}

const MIN = 320
const MAX = 2200
const breakpoints = Object.entries(grids).flatMap(([name, g]) => (g.screen ? [[name, screens[g.screen]] as const] : []))
const fontCaps = Object.values(grids).flatMap(g => (g.fontScalingMaxWidth ? [g.fontScalingMaxWidth] : []))
// Thumb is 24px wide, so its centre travels from 12px to 100% - 12px.
const onTrack = (w: number) => `calc(12px + (100% - 24px) * ${(w - MIN) / (MAX - MIN)})`

export function Simulator() {
  const [width, setWidth] = useState(1440)
  const [name, g] = activeGrid(width)
  const { scale, gut, col, root } = resolve(g, width)
  // cqw of the frame: % padding/gap would resolve against the parent, not the frame.
  const pct = (n: number) => `${(n * 100) / g.mockupWidth}cqw`

  return (
    <Frame title='Simulator'>
      <p className='flex items-baseline gap-2 font-mono text-xs text-muted'>
        Viewport width <span className='tabular-nums text-paper'>{width}px</span>
      </p>

      <div className='relative mt-2 pb-5'>
        <input
          type='range'
          aria-label='Simulated viewport width'
          aria-valuetext={`${width} pixels, ${name} grid`}
          min={MIN}
          max={MAX}
          value={width}
          onChange={e => setWidth(+e.target.value)}
          className='range'
        />
        {[...breakpoints.map(([bp, w]) => [`${bp} ${w}`, w, 'border-accent'] as const), ...fontCaps.map(w => [`font cap ${w}`, w, 'border-paper/40'] as const)].map(
          ([label, w, color]) => (
            <span
              key={label}
              aria-hidden='true'
              className='pointer-events-none absolute top-[4px] flex -translate-x-1/2 flex-col items-center gap-1.5 font-mono text-[10px] whitespace-nowrap text-muted'
              style={{ left: onTrack(w) }}>
              <span className={`h-4 border-l border-dashed ${color}`} />
              {label}
            </span>
          )
        )}
      </div>

      <div className='mt-4'>
        <div className='@container' style={{ width: `${(width / MAX) * 100}%` }}>
        <div
          className='relative flex h-32 overflow-hidden outline outline-1 -outline-offset-1 outline-paper/30'
          style={{ paddingInline: pct(g.margin), gap: pct(gut) }}>
          {Array.from({ length: g.columns }, (_, i) => (
            <div key={i} aria-hidden='true' className='flex-1 bg-accent/10 border-x border-accent/30' />
          ))}
          <p className='absolute bottom-3 font-serif leading-none whitespace-nowrap' style={{ left: pct(g.margin), fontSize: root * 2.25 }}>
            Aa <span className='font-mono text-[10px] text-muted'>text-4xl · {fmt(root * 2.25)}</span>
          </p>
        </div>
        </div>
        <p className='mt-1.5 font-mono text-[10px] text-muted'>viewport at {Math.round((width / MAX) * 100)}% of {MAX}px</p>
      </div>

      <div className='mt-6'>
        <Stats
          items={[
            ['grid', `${name} · ${g.columns} cols`],
            ['mockupWidth', `${g.mockupWidth}px`],
            ['fontScalingMaxWidth', g.fontScalingMaxWidth ? `${g.fontScalingMaxWidth}px` : 'none'],
            ['--grid-width', fmt((g.mockupWidth - 2 * g.margin) * scale)],
            ['--column', fmt(col * scale)],
            ['--gutter', fmt(gut * scale)],
            ['--margin', fmt(g.margin * scale)],
            ['1rem', `${fmt(root)}${root < (16 * width) / g.mockupWidth ? ' · capped' : ''}`]
          ]}
        />
      </div>
    </Frame>
  )
}

const fns = { span, gutter, margin }

export function Playground() {
  const [prefix, setPrefix] = useState<keyof typeof fns>('span')
  const [count, setCount] = useState(3)
  const [suffix, setSuffix] = useState('')
  const bar = useRef<HTMLDivElement>(null)
  const [px, setPx] = useState(0)

  const spread = prefix === 'span' ? suffix : ''
  const whole = Number.isInteger(count)
  const value = whole && !spread ? count : `${count}${spread ? ` ${spread}` : ''}`
  const className = whole ? `${prefix}-w-${count}${spread && `-${spread}`}` : `${prefix}-w-[${count}${spread && `_${spread}`}]`
  const css = `${(fns[prefix] as (v: number | string) => string | number)(value)}`

  useLayoutEffect(() => {
    const measure = () => setPx(bar.current!.getBoundingClientRect().width)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [css])

  const pill = (active: boolean) =>
    `inline-flex h-7 items-center rounded-full border px-3 leading-none [text-box:trim-both_cap_alphabetic] transition ${active ? 'border-accent text-accent' : 'border-paper/15 text-muted hover:text-paper'}`

  return (
    <Frame title='Playground'>
      <div role='group' aria-label='Utility' className='flex flex-wrap items-center gap-2 font-mono text-xs'>
        {(Object.keys(fns) as (keyof typeof fns)[]).map(p => (
          <button key={p} type='button' aria-pressed={prefix === p} className={pill(prefix === p)} onClick={() => setPrefix(p)}>
            {p}
          </button>
        ))}
        {prefix === 'span' && <span aria-hidden='true' className='mx-2 h-4 w-px bg-paper/15' />}
        {prefix === 'span' &&
          ['', 'wide', 'wider'].map(s => (
            <button key={s} type='button' aria-pressed={suffix === s} className={pill(suffix === s)} onClick={() => setSuffix(s)}>
              {s || 'none'}
            </button>
          ))}
      </div>

      <p className='mt-6 flex items-baseline gap-2 font-mono text-xs text-muted'>
        Count <span className='tabular-nums text-paper'>{count}</span>
      </p>
      <div className='mt-2'>
        <input
          type='range'
          aria-label={`${prefix} count`}
          min='0.5'
          max={prefix === 'span' ? 8 : 4}
          step='0.5'
          value={count}
          onChange={e => setCount(+e.target.value)}
          className='range'
        />
      </div>

      <div ref={bar} onTransitionEnd={() => setPx(bar.current!.getBoundingClientRect().width)} className='mt-6 h-8 max-w-full rounded-[2px] border border-accent/50 bg-accent/15 transition-[width] duration-500 ease-expo motion-reduce:transition-none' style={{ width: css }} />

      <div className='mt-4 space-y-1 font-mono text-xs'>
        <p className='text-accent'>{className}</p>
        <p className='break-all text-muted'>width: {css}</p>
        <p className='text-paper tabular-nums'>= {fmt(px)} at this viewport</p>
      </div>
    </Frame>
  )
}
