// label + input/select/textarea + error message, so forms don't repeat the same markup
export default function FormField({ label, as = 'input', options, error, className = '', ...props }) {
  const inputClass =
    'w-full rounded-md border border-gray-300 bg-white px-3 py-2 outline-none transition focus:border-pitch-600 dark:border-white/15 dark:bg-white/5 dark:focus:border-volt'

  let field
  if (as === 'select') {
    field = (
      <select className={inputClass} {...props}>
        {options.map((o) => {
          const value = typeof o === 'string' ? o : o.value
          const text = typeof o === 'string' ? o : o.label
          return <option key={value} value={value}>{text}</option>
        })}
      </select>
    )
  } else if (as === 'textarea') {
    field = <textarea className={inputClass} rows={4} {...props} />
  } else {
    field = <input className={inputClass} {...props} />
  }

  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      {field}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  )
}
