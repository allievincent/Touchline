export default function Card({ className = '', children }) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[.03] ${className}`}>
      {children}
    </div>
  )
}
