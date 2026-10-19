export default function Alert({ type = 'error', children }) {
  if (!children) return null
  const styles = {
    error: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300',
    success: 'border-pitch-200 bg-pitch-50 text-pitch-800 dark:border-pitch-800 dark:bg-pitch-950/50 dark:text-pitch-200',
  }
  return <div role="alert" className={`rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>{children}</div>
}
