import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import SessionRow from '../../components/SessionRow.jsx'
import Button from '../../components/Button.jsx'
import Spinner from '../../components/Spinner.jsx'
import Alert from '../../components/Alert.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import sessionService from '../../services/sessionService.js'
import { FOCUS_OPTIONS, LEVEL_OPTIONS, focusColor } from '../../utils/format.js'

// pill buttons for filtering. clicking the active one turns it off
function FilterPills({ label, options, value, onChange, colors }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 w-12 text-sm text-gray-500">{label}</span>
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(value === o ? '' : o)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition ${value === o
            ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
            : 'border-gray-300 hover:border-gray-500 dark:border-white/15 dark:hover:border-white/40'}`}>
          {colors && <span className="h-2 w-2 rounded-full" style={{ background: colors[o] }} />}
          {o}
        </button>
      ))}
    </div>
  )
}

export default function Sessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [filters, setFilters] = useState({ focus: '', level: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    sessionService.getSessions(filters)
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [filters])

  return (
    <>
      <PageHeader
        title="Training Sessions"
        subtitle={loading ? '' : `${sessions.length} coming up`}
        action={user.role === 'coach' && <Button to="/sessions/new">New Session</Button>}
      />

      <div className="mb-8 space-y-3">
        <FilterPills label="Focus" options={FOCUS_OPTIONS} colors={focusColor} value={filters.focus}
          onChange={(focus) => setFilters({ ...filters, focus })} />
        <FilterPills label="Level" options={LEVEL_OPTIONS} value={filters.level}
          onChange={(level) => setFilters({ ...filters, level })} />
      </div>

      <Alert>{error}</Alert>
      {loading ? (
        <Spinner />
      ) : sessions.length === 0 ? (
        <EmptyState title="Nothing matches that">Try a different focus or level.</EmptyState>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => <SessionRow key={s.id} session={s} />)}
        </div>
      )}
    </>
  )
}
