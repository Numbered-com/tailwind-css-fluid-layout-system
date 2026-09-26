import { Space_Mono, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import useGridControls from '../hooks/useGridControls'

const display = Space_Mono({ weight: ['400', '700'], style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-display' })
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
