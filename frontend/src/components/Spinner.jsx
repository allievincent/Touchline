export default function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-gray-500">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-pitch-500 border-t-transparent" />
      {label}
    </div>
  )
}
