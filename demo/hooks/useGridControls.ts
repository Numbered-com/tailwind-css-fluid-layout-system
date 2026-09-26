import { useEffect, useRef } from 'react'

export const toggleGrid = () => {
  const visibility = localStorage.getItem('guidelinesVisibility') === 'hidden' ? 'inherit' : 'hidden'
  localStorage.setItem('guidelinesVisibility', visibility)
  document.body.style.setProperty('--guidelines-visibility', visibility)
}

const useGridControls = () => {
  const keyPressed = useRef(false)

  const handleKeypress = (e: KeyboardEvent) => {
    if (e.key == 'g' && e.ctrlKey && !keyPressed.current) {
      keyPressed.current = true
      toggleGrid()
    }
  }

  const handleKeyup = (e: KeyboardEvent) => {
    if (e.key == 'g') {
      keyPressed.current = false
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('guidelinesVisibility')!) {
      localStorage.setItem('guidelinesVisibility', 'inherit')
    }

    document.body.style.setProperty('--guidelines-visibility', localStorage.getItem('guidelinesVisibility')!)

    window.addEventListener('keypress', handleKeypress)
    window.addEventListener('keyup', handleKeyup)

    return () => {
      window.removeEventListener('keypress', handleKeypress)
      window.removeEventListener('keyup', handleKeyup)
    }
  }, [])
}

export default useGridControls
