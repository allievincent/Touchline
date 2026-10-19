import EffortMeter from './EffortMeter.jsx'
import { kindColor } from '../utils/format.js'

// one journal entry. used on my log page and the coach's player logs page
export default function LogEntry({ log, showAuthor = false, actions, children }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[.03]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: kindColor[log.kind] }} />
            {log.kind} · {log.duration_minutes} min
            {showAuthor && <> · <span className="font-medium text-gray-800 dark:text-gray-200">{log.user.name}</span></>}
          </p>
          <h3 className="mt-0.5 text-2xl font-bold">{log.title}</h3>
        </div>
        <EffortMeter value={log.effort} />
      </div>

      {log.exercises.length > 0 && (
        <table className="mt-4 w-full max-w-lg text-sm">
          <tbody>
            {log.exercises.map((e) => (
              <tr key={e.id} className="border-t border-gray-100 dark:border-white/5">
                <td className="py-1.5 pr-4">{e.name}</td>
                <td className="py-1.5 pr-4 font-mono text-gray-600 dark:text-gray-400">
                  {e.sets ? `${e.sets}${e.reps ? ` × ${e.reps}` : ' sets'}` : e.reps ? `${e.reps} reps` : ''}
                </td>
                <td className="py-1.5 text-right font-mono text-gray-600 dark:text-gray-400">{e.weight ? `${e.weight} lb` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {log.notes && <p className="mt-3 whitespace-pre-line text-gray-700 dark:text-gray-300">{log.notes}</p>}

      {log.coach && !showAuthor && (
        <p className="mt-3 text-xs text-gray-500">Shared with Coach {log.coach.name}</p>
      )}
      {log.coach_feedback && (
        <div className="mt-3 rounded-md border-l-4 border-pitch-600 bg-pitch-50 px-4 py-2 text-sm dark:border-volt dark:bg-white/5">
          <span className="font-semibold">Coach {log.coach?.name}:</span> {log.coach_feedback}
        </div>
      )}

      {children}
      {actions && <div className="mt-4 flex gap-2">{actions}</div>}
    </article>
  )
}
