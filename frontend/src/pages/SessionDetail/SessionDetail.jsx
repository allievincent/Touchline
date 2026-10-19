import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import FormField from '../../components/FormField.jsx'
import Alert from '../../components/Alert.jsx'
import Spinner from '../../components/Spinner.jsx'
import SpotsBar from '../../components/SpotsBar.jsx'
import Badge, { LevelBadge } from '../../components/Badge.jsx'
import DateBlock from '../../components/DateBlock.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import sessionService from '../../services/sessionService.js'
import bookingService from '../../services/bookingService.js'
import { formatTime, focusColor } from '../../utils/format.js'

export default function SessionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [myBooking, setMyBooking] = useState(null)
  const [roster, setRoster] = useState([])
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const isMine = session && session.coach.id === user.id

  const load = useCallback(async () => {
    try {
      const s = await sessionService.getSession(id)
      setSession(s)
      if (s.coach.id === user.id) {
        setRoster(await sessionService.getRoster(id))
      } else {
        const bookings = await bookingService.getMyBookings()
        setMyBooking(bookings.find((b) => b.session.id === s.id) || null)
      }
    } catch (err) {
      setError(err.message)
    }
  }, [id, user.id])

  useEffect(() => { load() }, [load])

  const run = async (action, successMsg) => {
    setBusy(true); setError(''); setMessage('')
    try {
      await action()
      setMessage(successMsg)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const book = () => run(() => bookingService.bookSession(session.id, note), "You're booked. See you there!")
  const cancel = () => {
    if (!confirm('Cancel your spot in this session?')) return
    run(() => bookingService.cancelBooking(myBooking.id), 'Booking cancelled')
  }
  const remove = async () => {
    if (!confirm('Delete this session? Everyone booked will lose their spot.')) return
    try {
      await sessionService.deleteSession(session.id)
      navigate('/schedule')
    } catch (err) {
      setError(err.message)
    }
  }

  if (!session) return error ? <Alert>{error}</Alert> : <Spinner />

  const past = new Date(session.start_time) < new Date()

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>← Back</Button>
        <div className="mt-5 flex items-start gap-5 border-b border-gray-200 pb-6 dark:border-white/10">
          <DateBlock iso={session.start_time} />
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge><span className="h-2 w-2 rounded-full" style={{ background: focusColor[session.focus] }} />{session.focus}</Badge>
              <LevelBadge level={session.level} />
            </div>
            <h1 className="mt-2 text-4xl font-bold leading-none md:text-5xl">{session.title}</h1>
            <p className="mt-2 text-gray-500">
              Coach {session.coach.name}{session.coach.position ? ` (${session.coach.position})` : ''}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200 py-4 dark:divide-white/10 dark:border-white/10">
          {[['Starts', formatTime(session.start_time)], ['Length', `${session.duration_minutes} min`], ['Where', session.location]].map(([k, v]) => (
            <div key={k} className="px-4 first:pl-0">
              <dt className="text-sm text-gray-500">{k}</dt>
              <dd className="mt-0.5 font-display text-2xl font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-8 text-xl font-bold">About this session</h2>
        <p className="mt-2 whitespace-pre-line text-gray-700 dark:text-gray-300">{session.description || 'No description yet.'}</p>

        {/* the coach who made it sees who's coming */}
        {isMine && (
          <div className="mt-10">
            <h2 className="text-xl font-bold">Roster ({roster.length}/{session.capacity})</h2>
            {roster.length === 0 ? (
              <p className="mt-2 text-gray-500">Nobody has booked yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/[.03]">
                {roster.map((r, i) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                    <span className="font-medium"><span className="mr-3 font-display text-gray-400">{String(i + 1).padStart(2, '0')}</span>{r.user.name} <span className="text-sm font-normal text-gray-500">{r.user.position}</span></span>
                    {r.note && <span className="text-sm italic text-gray-500">"{r.note}"</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div>
        <Card className="lg:sticky lg:top-24">
          <SpotsBar booked={session.booked_count} capacity={session.capacity} />
          <div className="mt-5 space-y-3">
            <Alert>{error}</Alert>
            <Alert type="success">{message}</Alert>

            {isMine ? (
              <>
                <p className="text-sm text-gray-500">This is your session.</p>
                <Button to={`/sessions/${session.id}/edit`} variant="secondary" className="w-full">Edit session</Button>
                <Button variant="danger" className="w-full" onClick={remove}>Delete session</Button>
              </>
            ) : myBooking ? (
              <>
                <p className="text-lg font-semibold text-pitch-700 dark:text-volt">You're signed up</p>
                {myBooking.note && <p className="text-sm text-gray-500">Your note: "{myBooking.note}"</p>}
                {!past && <Button variant="secondary" className="w-full" onClick={cancel} disabled={busy}>Cancel booking</Button>}
              </>
            ) : past ? (
              <p className="text-gray-500">This session already happened.</p>
            ) : session.spots_left === 0 ? (
              <p className="font-medium text-red-600">This session is full.</p>
            ) : (
              <>
                <FormField label="Note for the coach (optional)" as="textarea" rows={2} maxLength={255}
                  placeholder="e.g. working on my weak foot" value={note} onChange={(e) => setNote(e.target.value)} />
                <Button className="w-full" onClick={book} disabled={busy}>{busy ? 'Booking...' : 'Book my spot'}</Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
