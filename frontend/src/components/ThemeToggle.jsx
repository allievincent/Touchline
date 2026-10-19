export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button type="button" onClick={onToggle} aria-label="Toggle dark mode" title="Toggle dark mode"
      className="rounded-md p-2 text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        {theme === 'dark'
          ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>
          : <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />}
      </svg>
    </button>
  )
}
