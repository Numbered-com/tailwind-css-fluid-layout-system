import 'tailwindcss/tailwind.css'
import useGridControls from '../hooks/useGridControls'

export default function App({ Component, pageProps }) {
  if (process.env.NODE_ENV === 'development') {
    useGridControls()
  }

  return <Component {...pageProps} />
}
