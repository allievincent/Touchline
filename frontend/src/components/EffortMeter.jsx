// 10 little ticks, filled up to how hard the workout felt
export default function EffortMeter({ value }) {
  const color = value >= 8 ? 'bg-red-500' : value >= 5 ? 'bg-amber-500' : 'bg-pitch-500'
  return (
    <span className="inline-flex items-center gap-2" title={`Effort ${value}/10`}>
      <span className="flex gap-[2px]" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={`h-3 w-1 rounded-sm ${i < value ? color : 'bg-gray-200 dark:bg-white/10'}`} />
        ))}
      </span>
      <span className="text-xs text-gray-500">{value}/10</span>
    </span>
  )
}
