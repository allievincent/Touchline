import { useEffect, useState } from 'react'
import Button from '../../components/Button.jsx'
import SessionRow from '../../components/SessionRow.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import sessionService from '../../services/sessionService.js'
import { kindColor } from '../../utils/format.js'
import field from '../../assets/field.svg'

export default function Home() {
  const { user } = useAuth()
  const [upcoming, setUpcoming] = useState([])

  useEffect(() => {
    sessionService.getSessions().then((s) => setUpcoming(s.slice(0, 4))).catch(() => {})
  }, [])

  return (
    <div className="space-y-20">
      <section className="relative -mx-4 -mt-10 grid items-center gap-10 px-4 pb-14 pt-14 md:grid-cols-[1.1fr_1fr]">
        {/* mowed grass stripes, in their own layer so the fade doesn't fade the buttons */}
        <div className="stripes pointer-events-none absolute inset-0 -z-10" />
        <div>
          <h1 className="text-5xl font-extrabold leading-[0.95] md:text-6xl">
            Training sessions <span className="text-pitch-700 dark:text-volt">+ your training log</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-gray-600 dark:text-gray-400">
            Book a spot in a coach's session (keeper training, finishing, fitness, pickup games) and keep
            track of your own lifts and practices in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <>
                <Button to="/sessions" size="lg">Find a session</Button>
                <Button to="/log/new" size="lg" variant="secondary">Log a workout</Button>
              </>
            ) : (
              <>
                <Button to="/register" size="lg">Create an account</Button>
                <Button to="/login" size="lg" variant="secondary">Log in</Button>
              </>
            )}
          </div>
        </div>
        <img src={field} alt="Drawing of a soccer field from above" className="w-full -rotate-2 rounded-xl shadow-2xl" />
      </section>

      {upcoming.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between border-b border-gray-200 pb-3 dark:border-white/10">
            <h2 className="text-3xl font-bold">This week</h2>
            <Button to={user ? '/sessions' : '/login'} variant="ghost" size="sm">All sessions →</Button>
          </div>
          <div className="space-y-3">
            {upcoming.map((s) => <SessionRow key={s.id} session={s} />)}
          </div>
        </section>
      )}

      {/* quick pitch for the training log with a fake preview of a week */}
      <section className="grid items-center gap-10 rounded-xl bg-pitch-800 p-8 text-white dark:bg-white/[.04] md:grid-cols-2 md:p-12">
        <div>
          <h2 className="text-4xl font-bold">Keep a training log</h2>
          <p className="mt-3 text-pitch-100 dark:text-gray-400">
            Write down every lift, practice, run and game, with sets, reps, weight and how hard it felt.
            It's private by default. Share an entry with a coach if you want feedback on it.
          </p>
          <Button to={user ? '/log' : '/register'} className="mt-6 !bg-volt !text-pitch-950 hover:!bg-[#c4de3a]">Open my log</Button>
        </div>
        <div className="flex justify-center gap-2" aria-hidden="true">
          {[['Lift'], ['Recovery'], ['Game'], ['Practice'], [], ['Conditioning'], ['Lift', 'Practice']].map((day, i) => (
            <div key={i} className="text-center">
              <div className="flex h-24 w-9 flex-col overflow-hidden rounded border border-white/20">
                {day.map((k) => <span key={k} className="flex-1" style={{ background: kindColor[k] }} />)}
              </div>
              <span className="text-xs text-white/60">{'MTWTFSS'[i]}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
