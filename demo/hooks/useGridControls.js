import { useEffect, useRef } from 'react'

const useGridControls = () => {
  const keyPressed = useRef(false)

  const handleKeypress = e => {
    if (e.key == 'g' && e.ctrlKey && !keyPressed.current) {
      keyPressed.current = true
      toggleGrid()
    }
  }

  const handleKeyup = e => {
    if (e.key == 'g') {
      keyPressed.current = false
    }
  }

  const toggleGrid = () => {
    const visibility = localStorage.getItem('guidelinesVisibility') === 'inherit' ? 'hidden' : 'inherit'
    localStorage.setItem('guidelinesVisibility', visibility)
    document.body.style.setProperty('--guidelines-visibility', visibility)
  }

  useEffect(() => {
    if (!localStorage.getItem('guidelinesVisibility')) {
      localStorage.setItem('guidelinesVisibility', 'inherit')
    }

    window.addEventListener('keypress', handleKeypress)
    window.addEventListener('keyup', handleKeyup)

    return () => {
      window.removeEventListener('keypress', handleKeypress)
      window.removeEventListener('keyup', handleKeyup)
    }
  })
}

export default useGridControls
