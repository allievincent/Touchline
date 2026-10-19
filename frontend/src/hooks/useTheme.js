import { useEffect, useState } from 'react'

export default function useTheme() {
  const [theme, setTheme] = useState(() => (document.documentElement.classList.contains('dark') ? 'dark' : 'light'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try { localStorage.setItem('theme', theme) } catch { /* ignore */ }
  }, [theme])

  return { theme, toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark') }
}
