import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../../components/Card.jsx'
import FormField from '../../components/FormField.jsx'
import Button from '../../components/Button.jsx'
import Alert from '../../components/Alert.jsx'
import Spinner from '../../components/Spinner.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import logService from '../../services/logService.js'
import userService from '../../services/userService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { KIND_OPTIONS, kindColor, todayString } from '../../utils/format.js'

const blankExercise = { name: '', sets: '', reps: '', weight: '' }

export default function LogForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    date: todayString(), kind: 'Lift', title: '', duration_minutes: 60, effort: 6, notes: '', coach_id: '',
  })
  const [exercises, setExercises] = useState([{ ...blankExercise }])
  const [coaches, setCoaches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const jobs = [userService.getUsers('coach').then((c) => setCoaches(c.filter((x) => x.id !== user.id)))]
    if (editing) {
      jobs.push(logService.getLog(id).then((log) => {
        setForm({ ...log, coach_id: log.coach?.id ?? '' })
        setExercises(log.exercises.map((e) => ({ name: e.name, sets: e.sets ?? '', reps: e.reps ?? '', weight: e.weight ?? '' })))
      }))
    }
    Promise.all(jobs).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [id, editing, user.id])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const updateExercise = (i, field, value) =>
    setExercises(exercises.map((ex, j) => (j === i ? { ...ex, [field]: value } : ex)))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const toNum = (v) => (v === '' || v == null ? null : Number(v))
    const body = {
      date: form.date, kind: form.kind, title: form.title, notes: form.notes,
      duration_minutes: Number(form.duration_minutes), effort: Number(form.effort),
      coach_id: form.coach_id === '' ? null : Number(form.coach_id),
      // skip empty rows
      exercises: exercises.filter((ex) => ex.name.trim()).map((ex) => ({
        name: ex.name.trim(), sets: toNum(ex.sets), reps: toNum(ex.reps), weight: toNum(ex.weight),
      })),
    }
    try {
      if (editing) await logService.updateLog(id, body)
      else await logService.createLog(body)
      navigate('/log')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <Spinner />

  const small = 'w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-pitch-600 dark:border-white/15 dark:bg-white/5 dark:focus:border-volt'

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={editing ? 'Edit entry' : 'Log a workout'} />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Alert>{error}</Alert>

          <div className="flex flex-wrap gap-2">
            {KIND_OPTIONS.map((k) => (
              <button key={k} type="button" onClick={() => setForm({ ...form, kind: k })}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition ${form.kind === k
                  ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                  : 'border-gray-300 dark:border-white/15'}`}>
                <span className="h-2 w-2 rounded-full" style={{ background: kindColor[k] }} />{k}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
            <FormField label="What did you do?" required placeholder="e.g. Lower body, Team practice" value={form.title} onChange={update('title')} />
            <FormField label="Date" type="date" required value={form.date} onChange={update('date')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Minutes" type="number" min="1" max="600" required value={form.duration_minutes} onChange={update('duration_minutes')} />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">How hard was it? <b className="text-gray-900 dark:text-white">{form.effort}/10</b></span>
              <input type="range" min="1" max="10" value={form.effort} onChange={update('effort')} className="mt-2 w-full accent-pitch-700 dark:accent-volt" />
            </label>
          </div>

          {/* exercise rows, mostly for lifts */}
          <div>
            <span className="mb-2 block text-sm font-medium text-gray-600 dark:text-gray-400">Exercises (optional)</span>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_4rem_4rem_5rem_2rem] gap-2 text-xs text-gray-500">
                <span>Exercise</span><span>Sets</span><span>Reps</span><span>Weight (lb)</span><span />
              </div>
              {exercises.map((ex, i) => (
                <div key={i} className="grid grid-cols-[1fr_4rem_4rem_5rem_2rem] gap-2">
                  <input className={small} placeholder="Back squat" value={ex.name} aria-label="Exercise name" onChange={(e) => updateExercise(i, 'name', e.target.value)} />
                  <input className={small} type="number" min="1" value={ex.sets} aria-label="Sets" onChange={(e) => updateExercise(i, 'sets', e.target.value)} />
                  <input className={small} type="number" min="1" value={ex.reps} aria-label="Reps" onChange={(e) => updateExercise(i, 'reps', e.target.value)} />
                  <input className={small} type="number" min="0" step="2.5" value={ex.weight} aria-label="Weight" onChange={(e) => updateExercise(i, 'weight', e.target.value)} />
                  <button type="button" aria-label="Remove exercise" className="text-gray-400 hover:text-red-600"
                    onClick={() => setExercises(exercises.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setExercises([...exercises, { ...blankExercise }])}
              className="mt-2 text-sm font-medium text-pitch-700 hover:underline dark:text-volt">+ Add exercise</button>
          </div>

          <FormField label="Notes" as="textarea" placeholder="How did it feel? Anything to remember next time?" value={form.notes} onChange={update('notes')} />

          <FormField label="Share with a coach" as="select" value={form.coach_id} onChange={update('coach_id')}
            options={[{ value: '', label: 'No, keep it private' }, ...coaches.map((c) => ({ value: c.id, label: `Coach ${c.name}` }))]} />

          <div className="flex gap-3 pt-2">
            <Button type="submit">{editing ? 'Save changes' : 'Save entry'}</Button>
            <Button variant="secondary" onClick={() => navigate('/log')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
