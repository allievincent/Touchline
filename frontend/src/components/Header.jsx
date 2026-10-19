import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import Button from './Button.jsx'
import logo from '../assets/logo.svg'

export default function Header({ theme, toggleTheme }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const links = user
    ? [
        { to: '/sessions', label: 'Sessions' },
        { to: '/schedule', label: 'My Schedule' },
        { to: '/log', label: 'Training Log' },
        ...(user.role === 'coach' ? [{ to: '/log/shared', label: 'Player Logs' }] : []),
        { to: '/profile', label: 'Profile' },
      ]
    : []

  const linkClass = ({ isActive }) =>
    `border-b-2 px-3 py-5 text-[15px] font-medium transition ${isActive ? 'border-pitch-700 text-gray-900 dark:border-volt dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-chalk/90 backdrop-blur dark:border-white/10 dark:bg-[#0b120e]/90">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="" className="h-7 w-7" />
          <span className="font-display text-2xl font-bold uppercase tracking-wider">Touchline</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => <NavLink key={l.to} to={l.to} end className={linkClass}>{l.label}</NavLink>)}
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleLogout}>Log out</Button>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm">Log in</Button>
              <Button to="/register" size="sm">Sign up</Button>
            </>
          )}
        </div>

        <div className="flex items-center md:hidden">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <button type="button" onClick={() => setOpen(!open)} className="p-2 text-xl" aria-label="Menu" aria-expanded={open}>
            {open ? '✕' : '≡'}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-gray-200 px-4 py-2 dark:border-white/10 md:hidden" onClick={() => setOpen(false)}>
          {links.map((l) => <NavLink key={l.to} to={l.to} end className={(s) => `block !border-b-0 !py-3 ${linkClass(s)}`}>{l.label}</NavLink>)}
          {user ? (
            <button type="button" onClick={handleLogout} className="block w-full px-3 py-3 text-left font-medium text-red-600">Log out</button>
          ) : (
            <>
              <NavLink to="/login" className={(s) => `block !border-b-0 !py-3 ${linkClass(s)}`}>Log in</NavLink>
              <NavLink to="/register" className={(s) => `block !border-b-0 !py-3 ${linkClass(s)}`}>Sign up</NavLink>
            </>
          )}
        </div>
      )}
    </header>
  )
}
