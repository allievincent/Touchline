import { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader.jsx'
import SessionRow from '../../components/SessionRow.jsx'
import Button from '../../components/Button.jsx'
import Spinner from '../../components/Spinner.jsx'
import Alert from '../../components/Alert.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import bookingService from '../../services/bookingService.js'
import sessionService from '../../services/sessionService.js'

export default function Schedule() {
  const { user } = useAuth()
  const isCoach = user.role === 'coach'
  const [bookings, setBookings] = useState([])
  const [mySessions, setMySessions] = useState([])
  const [editingNote, setEditingNote] = useState(null) // { id, note }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [b, s] = await Promise.all([
        bookingService.getMyBookings(),
        isCoach ? sessionService.getSessions({ coach_id: user.id }) : Promise.resolve([]),
      ])
      setBookings(b)
      setMySessions(s)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [])

  const cancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try { await bookingService.cancelBooking(id); load() } catch (err) { setError(err.message) }
  }

  const saveNote = async () => {
    try { await bookingService.updateNote(editingNote.id, editingNote.note || null); setEditingNote(null); load() } catch (err) { setError(err.message) }
  }

  if (loading) return <Spinner />

  return (
    <>
      <PageHeader title="My schedule" />
      <Alert>{error}</Alert>

      {isCoach && (
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Sessions I'm coaching</h2>
            <Button to="/sessions/new" size="sm">New Session</Button>
          </div>
          {mySessions.length === 0 ? (
            <EmptyState title="You haven't posted any sessions">Create one and players can start booking.</EmptyState>
          ) : (
            <div className="space-y-3">
              {mySessions.map((s) => (
                <SessionRow key={s.id} session={s}
                  actions={<Button to={`/sessions/${s.id}/edit`} size="sm" variant="secondary">Edit</Button>} />
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="mb-4 text-2xl font-bold">Sessions I've booked</h2>
        {bookings.length === 0 ? (
          <EmptyState title="Nothing booked yet">
            <Button to="/sessions" className="mt-3">Find a session</Button>
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <SessionRow key={b.id} session={b.session} actions={
                editingNote?.id === b.id ? (
                  <div className="space-y-2 sm:w-48">
                    <input value={editingNote.note} maxLength={255} autoFocus
                      onChange={(e) => setEditingNote({ ...editingNote, note: e.target.value })}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-white/15 dark:bg-white/5" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveNote}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingNote(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="sm:w-48">
                    <p className="truncate text-xs text-gray-500" title={b.note || ''}>{b.note ? `"${b.note}"` : 'No note'}</p>
                    <div className="mt-1 flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => setEditingNote({ id: b.id, note: b.note || '' })}>Edit note</Button>
                      <Button size="sm" variant="ghost" className="text-red-600 dark:text-red-400" onClick={() => cancel(b.id)}>Cancel</Button>
                    </div>
                  </div>
                )
              } />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
