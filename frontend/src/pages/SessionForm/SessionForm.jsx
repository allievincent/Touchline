import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../../components/Card.jsx'
import FormField from '../../components/FormField.jsx'
import Button from '../../components/Button.jsx'
import Alert from '../../components/Alert.jsx'
import Spinner from '../../components/Spinner.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import sessionService from '../../services/sessionService.js'
import { FOCUS_OPTIONS, LEVEL_OPTIONS, toInputValue } from '../../utils/format.js'

const empty = {
  title: '', focus: 'Goalkeeping', level: 'Beginner', description: '',
  location: '', start_time: '', duration_minutes: 60, capacity: 10,
}

// same form for creating and editing. if there's an :id in the url we're editing
export default function SessionForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editing) return
    sessionService.getSession(id)
      .then((s) => setForm({ ...s, start_time: toInputValue(s.start_time) }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, editing])

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const body = {
      title: form.title, focus: form.focus, level: form.level, description: form.description,
      location: form.location, start_time: form.start_time,
      duration_minutes: Number(form.duration_minutes), capacity: Number(form.capacity),
    }
    try {
      const saved = editing ? await sessionService.updateSession(id, body) : await sessionService.createSession(body)
      navigate(`/sessions/${saved.id}`)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={editing ? 'Edit session' : 'New session'} subtitle="Players will see this on the sessions page" />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>{error}</Alert>
          <FormField label="Title" required placeholder="e.g. Goalkeeper Fundamentals" value={form.title} onChange={update('title')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Focus" as="select" options={FOCUS_OPTIONS} value={form.focus} onChange={update('focus')} />
            <FormField label="Level" as="select" options={LEVEL_OPTIONS} value={form.level} onChange={update('level')} />
          </div>
          <FormField label="Description" as="textarea" placeholder="What will you work on? What should players bring?" value={form.description} onChange={update('description')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Date & time" type="datetime-local" required value={form.start_time} onChange={update('start_time')} />
            <FormField label="Location" required placeholder="e.g. Main Field" value={form.location} onChange={update('location')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Length (minutes)" type="number" min="15" max="240" step="15" required value={form.duration_minutes} onChange={update('duration_minutes')} />
            <FormField label="Max players" type="number" min="1" max="100" required value={form.capacity} onChange={update('capacity')} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Create session'}</Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
