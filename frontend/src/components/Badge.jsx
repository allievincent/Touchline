// small outlined label. levels get 1-3 bars like a signal meter
export default function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-600 dark:border-white/15 dark:text-gray-300 ${className}`}>
      {children}
    </span>
  )
}

const bars = { Beginner: 1, Intermediate: 2, Advanced: 3 }

export function LevelBadge({ level }) {
  return (
    <Badge>
      <span className="flex items-end gap-[2px]" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} style={{ height: 3 + n * 3 }}
            className={`w-[3px] rounded-sm ${n <= bars[level] ? 'bg-pitch-600 dark:bg-volt' : 'bg-gray-300 dark:bg-white/20'}`} />
        ))}
      </span>
      {level}
    </Badge>
  )
}
