export default function EmptyState({ title, children }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center dark:border-white/15">
      <h3 className="text-xl font-bold">{title}</h3>
      {children && <div className="mt-2 text-gray-500">{children}</div>}
    </div>
  )
}
