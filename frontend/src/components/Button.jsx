import { Link } from 'react-router-dom'

const variants = {
  primary: 'bg-pitch-700 text-white hover:bg-pitch-800 dark:bg-volt dark:text-pitch-950 dark:hover:bg-[#c4de3a] disabled:opacity-50',
  secondary: 'border border-gray-300 bg-white text-gray-900 hover:border-gray-900 dark:border-white/15 dark:bg-transparent dark:text-gray-100 dark:hover:border-white/60',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
  ghost: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
}
const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-base' }

// reusable button. "to" makes it a router link, otherwise it's a normal <button>
export default function Button({ to, variant = 'primary', size = 'md', className = '', children, ...props }) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`
  if (to) return <Link to={to} className={classes} {...props}>{children}</Link>
  return <button type="button" className={classes} {...props}>{children}</button>
}
