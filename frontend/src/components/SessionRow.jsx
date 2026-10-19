import { Link } from 'react-router-dom'
import DateBlock from './DateBlock.jsx'
import { LevelBadge } from './Badge.jsx'
import SpotsBar from './SpotsBar.jsx'
import { formatTime, focusColor } from '../utils/format.js'

// one session in a list, laid out like a fixtures list on a club website
export default function SessionRow({ session, actions }) {
  return (
    <div className="group relative flex flex-col gap-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 pl-5 transition hover:border-gray-400 dark:border-white/10 dark:bg-white/[.03] dark:hover:border-white/30 sm:flex-row sm:items-center">
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: focusColor[session.focus] }} />

      <Link to={`/sessions/${session.id}`} className="flex flex-1 items-center gap-4">
        <DateBlock iso={session.start_time} />
        <div className="min-w-0">
          <p className="text-sm text-gray-500">
            {session.focus} · {formatTime(session.start_time)} · {session.duration_minutes} min
          </p>
          <h3 className="truncate text-2xl font-bold leading-tight group-hover:text-pitch-700 dark:group-hover:text-volt">{session.title}</h3>
          <p className="text-sm text-gray-500">{session.location} · Coach {session.coach.name}</p>
        </div>
      </Link>

      <div className="flex items-center gap-4 sm:w-64 sm:justify-end">
        <div className="hidden md:block"><LevelBadge level={session.level} /></div>
        <div className="w-28"><SpotsBar booked={session.booked_count} capacity={session.capacity} compact /></div>
      </div>
      {actions && <div className="flex gap-2 sm:ml-2">{actions}</div>}
    </div>
  )
}
