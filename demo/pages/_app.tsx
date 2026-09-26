import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import useGridControls from '../hooks/useGridControls'

const display = Instrument_Serif({ weight: '400', subsets: ['latin'], variable: '--font-display' })
const body = Inter_Tight({ subsets: ['latin'], variable: '--font-body' })
const code = JetBrains_Mono({ subsets: ['latin'], variable: '--font-code' })

export default function App({ Component, pageProps }: AppProps) {
  if (process.env.NODE_ENV === 'development') {
    useGridControls()
  }

  return (
    <div className={`${display.variable} ${body.variable} ${code.variable} font-sans`}>
      <Component {...pageProps} />
    </div>
  )
}
