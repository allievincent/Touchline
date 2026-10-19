import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import LogEntry from '../../components/LogEntry.jsx'
import Button from '../../components/Button.jsx'
import Spinner from '../../components/Spinner.jsx'
import Alert from '../../components/Alert.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import logService from '../../services/logService.js'
import { dayLabel } from '../../utils/format.js'

// coaches see logs players shared with them and can reply
function FeedbackBox({ log, onSaved }) {
  const [text, setText] = useState(log.coach_feedback || '')
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  const save = async () => {
    try {
      onSaved(await logService.leaveFeedback(log.id, text))
      setOpen(false)
    } catch (err) {
      setError(err.message)
    }
  }

  if (!open) {
    return (
      <Button size="sm" variant="secondary" className="mt-4" onClick={() => setOpen(true)}>
        {log.coach_feedback ? 'Edit feedback' : 'Leave feedback'}
      </Button>
    )
  }
  return (
    <div className="mt-4 space-y-2">
      <Alert>{error}</Alert>
      <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} autoFocus
        placeholder="Nice session, next week try..."
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-white/15 dark:bg-white/5" />
      <div className="flex gap-2">
        <Button size="sm" onClick={save}>Send</Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  )
}

export default function PlayerLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    logService.getSharedWithMe().then(setLogs).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [])

  const replace = (updated) => setLogs(logs.map((l) => (l.id === updated.id ? updated : l)))
  const waiting = logs.filter((l) => !l.coach_feedback).length

  if (loading) return <Spinner />

  return (
    <>
      <PageHeader title="Player logs" subtitle={logs.length ? `${waiting} waiting on feedback` : null} />
      <Alert>{error}</Alert>
      {logs.length === 0 ? (
        <EmptyState title="No shared logs yet">When a player shares an entry with you, it shows up here.</EmptyState>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id}>
              <p className="mb-1 text-sm text-gray-500">{dayLabel(log.date)}</p>
              <LogEntry log={log} showAuthor>
                <FeedbackBox log={log} onSaved={replace} />
              </LogEntry>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
