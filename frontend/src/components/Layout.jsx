import { Outlet } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import useTheme from '../hooks/useTheme.js'

// every page gets the header + footer from here
export default function Layout() {
  const { theme, toggle } = useTheme()
  return (
    <div className="flex min-h-screen flex-col">
      <Header theme={theme} toggleTheme={toggle} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
