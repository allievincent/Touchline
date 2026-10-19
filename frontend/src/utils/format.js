export const formatDay = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

// "2026-10-20T17:00:00" -> "2026-10-20T17:00" for <input type="datetime-local">
export const toInputValue = (iso) => (iso ? iso.slice(0, 16) : '')

export const FOCUS_OPTIONS = ['Goalkeeping', 'Finishing', 'Passing', 'Defending', 'Fitness', 'Small-Sided Games']
export const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced']
export const POSITION_OPTIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward']

// colored stripe on the left of each session so you can scan by focus
export const focusColor = {
  Goalkeeping: '#d7f24a',
  Finishing: '#f97316',
  Passing: '#38bdf8',
  Defending: '#a78bfa',
  Fitness: '#f43f5e',
  'Small-Sided Games': '#22c55e',
}

// splits a date into the pieces for the little calendar block
export const dateParts = (iso) => {
  const d = new Date(iso)
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    day: d.getDate(),
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  }
}

export const KIND_OPTIONS = ['Lift', 'Practice', 'Conditioning', 'Game', 'Recovery']
export const kindColor = {
  Lift: '#f97316',
  Practice: '#22c55e',
  Conditioning: '#f43f5e',
  Game: '#38bdf8',
  Recovery: '#a78bfa',
}

// "2026-10-18" -> Date at local midnight (new Date("2026-10-18") would be UTC and can show the day before)
export const parseDay = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayString = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const dayLabel = (s) => {
  const diff = Math.round((parseDay(todayString()) - parseDay(s)) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return parseDay(s).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}
