import Head from 'next/head'
import { toggleGrid } from '../hooks/useGridControls'
import MarkdownSample from '../components/Grid.mdx'

export default function Index() {
  return (
    <div className='antialiased bg-ink text-paper min-h-screen'>
      <Head>
        <title>Fluid Layout System</title>
      </Head>
      <nav aria-label='Main' className='fixed inset-x-0 top-0 z-10 border-b border-paper/10 bg-ink/80 backdrop-blur'>
        <div className='grid-container flex h-14 items-center'>
          <div className='flex w-full items-center justify-between lg:span-w-8 lg:span-ml-2-wide'>
            <span className='flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em]'>
              <svg aria-hidden='true' className='h-3.5 w-3.5 text-accent' viewBox='0 0 14 14' fill='currentColor'>
                <rect x='0' width='3' height='14' />
                <rect x='5.5' width='3' height='14' />
                <rect x='11' width='3' height='14' />
              </svg>
              Fluid Layout System
            </span>
            <div className='flex items-center gap-5'>
            <button type='button' onClick={toggleGrid} aria-label='Toggle grid guidelines' className='font-mono text-xs uppercase tracking-[0.2em] text-muted hover:text-accent transition'>
              Grid
            </button>
            <a
              href='https://github.com/Numbered-com/tailwind-css-fluid-layout-system'
              className='inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition'>
              <svg aria-hidden='true' className='h-4 w-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z'
                  clipRule='evenodd'
                />
              </svg>
              <span>GitHub</span>
            </a>
            </div>
          </div>
        </div>
      </nav>
      <article className='grid-container pt-14 pb-16'>
        <header className='pt-16 pb-10 md:pt-24 md:pb-16 lg:span-w-8 lg:span-ml-2-wide'>
          <p className='font-mono text-xs uppercase tracking-[0.2em] text-accent'>A Tailwind CSS plugin by Numbered</p>
          <h1 className='mt-4 font-serif text-4xl md:text-5xl lg:text-6xl leading-none tracking-tight'>
            Fluid, column-based layouts <em className='text-accent'>that scale with the viewport.</em>
          </h1>
        </header>
        <div className='prose prose-invert prose-sm md:prose-base max-w-none lg:span-w-8 lg:span-ml-2-wide'>
          <MarkdownSample />
        </div>
      </article>
    </div>
  )
}
