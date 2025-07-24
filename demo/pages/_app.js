import 'tailwindcss/tailwind.css'
import useGridControls from '../hooks/useGridControls'

export default function App({ Component, pageProps }) {
  if (process.env.NODE_ENV === 'development') {
    useGridControls()
  }

  // useEffect(() => {
  //   const resize = () => {
  //     const sbw = window.innerWidth - document.body.offsetWidth
  //     document.documentElement.style.setProperty('--sbw', `${sbw}px`)
  //   }
  //   window.addEventListener('resize', resize)
  //   resize()

  //   return () => {
  //     window.removeEventListener('resize', resize)
  //   }
  // }, [])

  return <Component {...pageProps} />
}
