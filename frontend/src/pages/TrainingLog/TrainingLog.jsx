import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import Button from '../../components/Button.jsx'
import LogEntry from '../../components/LogEntry.jsx'
import Spinner from '../../components/Spinner.jsx'
import Alert from '../../components/Alert.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import logService from '../../services/logService.js'
import { KIND_OPTIONS, kindColor, dayLabel, parseDay, todayString } from '../../utils/format.js'

// the last 7 days as little boxes, colored by what you did that day
function WeekStrip({ logs }) {
  const today = parseDay(todayString())
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return { key, letter: d.toLocaleDateString('en-US', { weekday: 'narrow' }), entries: logs.filter((l) => l.date === key) }
  })
  const week = days.flatMap((d) => d.entries)
  const minutes = week.reduce((sum, l) => sum + l.duration_minutes, 0)
  const avgEffort = week.length ? (week.reduce((sum, l) => sum + l.effort, 0) / week.length).toFixed(1) : '-'

  return (
    <div className="mb-10 flex flex-wrap items-end gap-8 rounded-lg border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[.03]">
      <div>
        <p className="mb-2 text-sm text-gray-500">Last 7 days</p>
        <div className="flex gap-1.5">
          {days.map((d) => (
            <div key={d.key} className="text-center">
              <div className="flex h-10 w-8 flex-col overflow-hidden rounded border border-gray-200 dark:border-white/10" title={d.entries.map((e) => e.title).join(', ')}>
                {d.entries.map((e) => <span key={e.id} className="flex-1" style={{ background: kindColor[e.kind] }} />)}
              </div>
              <span className="text-xs text-gray-500">{d.letter}</span>
            </div>
          ))}
        </div>
      </div>
      {[['Workouts', week.length], ['Minutes', minutes], ['Avg effort', avgEffort]].map(([label, value]) => (
        <div key={label}>
          <p className="font-display text-4xl font-bold leading-none">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      ))}
    </div>
  )
}

export default function TrainingLog() {
  const [logs, setLogs] = useState([])
  const [kind, setKind] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () =>
    logService.getMyLogs()
      .then(setLogs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const remove = async (id) => {
    if (!confirm('Delete this entry?')) return
    try { await logService.deleteLog(id); load() } catch (err) { setError(err.message) }
  }

  // filter on the frontend so the week strip always shows everything
  const shown = kind ? logs.filter((l) => l.kind === kind) : logs
  const byDay = shown.reduce((groups, log) => {
    (groups[log.date] ||= []).push(log)
    return groups
  }, {})

  if (loading) return <Spinner />

  return (
    <>
      <PageHeader title="Training log" subtitle="Lifts, practices, runs, games. Private unless you share an entry with a coach."
        action={<Button to="/log/new">New entry</Button>} />
      <Alert>{error}</Alert>

      <WeekStrip logs={logs} />

      <div className="mb-6 flex flex-wrap gap-2">
        {['', ...KIND_OPTIONS].map((k) => (
          <button key={k || 'all'} type="button" onClick={() => setKind(k)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition ${kind === k
              ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
              : 'border-gray-300 hover:border-gray-500 dark:border-white/15'}`}>
            {k && <span className="h-2 w-2 rounded-full" style={{ background: kindColor[k] }} />}
            {k || 'All'}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState title={kind ? `No ${kind.toLowerCase()} entries yet` : 'Nothing logged yet'}>
          <Button to="/log/new" className="mt-3">Log a workout</Button>
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {Object.entries(byDay).map(([day, entries]) => (
            <section key={day}>
              <h2 className="mb-3 text-lg font-semibold text-gray-500">{dayLabel(day)}</h2>
              <div className="space-y-3">
                {entries.map((log) => (
                  <LogEntry key={log.id} log={log} actions={<>
                    <Button to={`/log/${log.id}/edit`} size="sm" variant="secondary">Edit</Button>
                    <Button size="sm" variant="ghost" className="text-red-600 dark:text-red-400" onClick={() => remove(log.id)}>Delete</Button>
                  </>} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
