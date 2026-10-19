// one dot per spot (filled = taken). big sessions just get a bar
export default function SpotsBar({ booked, capacity, compact = false }) {
  const left = capacity - booked
  const label = left === 0 ? 'Full' : `${left} left`

  if (capacity > 20 || compact) {
    return (
      <div className="w-full">
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
          <div className={`h-full ${left === 0 ? 'bg-red-500' : 'bg-pitch-600 dark:bg-volt'}`} style={{ width: `${(booked / capacity) * 100}%` }} />
        </div>
        <p className="mt-1 text-xs text-gray-500">{label}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1" aria-label={`${booked} of ${capacity} spots taken`}>
        {Array.from({ length: capacity }, (_, i) => (
          <span key={i} className={`h-3 w-3 rounded-full border ${i < booked
            ? 'border-pitch-700 bg-pitch-700 dark:border-volt dark:bg-volt'
            : 'border-gray-300 dark:border-white/25'}`} />
        ))}
      </div>
      <p className={`mt-1.5 text-xs ${left === 0 ? 'font-semibold text-red-600' : 'text-gray-500'}`}>{label} · {booked}/{capacity} booked</p>
    </div>
  )
}
