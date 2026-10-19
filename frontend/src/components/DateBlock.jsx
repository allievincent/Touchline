import { dateParts } from '../utils/format.js'

// little tear-off calendar style date
export default function DateBlock({ iso }) {
  const { weekday, day, month } = dateParts(iso)
  return (
    <div className="flex w-16 shrink-0 flex-col items-center rounded-md border border-gray-200 bg-white py-1.5 dark:border-white/10 dark:bg-white/5">
      <span className="text-[10px] font-semibold tracking-widest text-gray-500">{weekday}</span>
      <span className="font-display text-3xl font-bold leading-none">{day}</span>
      <span className="text-[10px] font-semibold tracking-widest text-pitch-700 dark:text-volt">{month}</span>
    </div>
  )
}
