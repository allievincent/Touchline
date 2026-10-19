export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-white/10">
      <div>
        <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-1 text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
