import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card.jsx'
import FormField from '../../components/FormField.jsx'
import Button from '../../components/Button.jsx'
import Alert from '../../components/Alert.jsx'
import PageHeader from '../../components/PageHeader.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import userService from '../../services/userService.js'
import { POSITION_OPTIONS } from '../../utils/format.js'

export default function Profile() {
  const { user, setUser, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: user.name, email: user.email, position: user.position || 'Goalkeeper', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    setError(''); setMessage('')
    const changes = { name: form.name, email: form.email, position: form.position }
    if (form.password) changes.password = form.password // only send it if they typed a new one
    try {
      setUser(await userService.updateMe(changes))
      setForm({ ...form, password: '' })
      setMessage('Profile saved')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete your account? This also removes your bookings and any sessions you coach.')) return
    try {
      await userService.deleteMe()
      logout()
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Profile" subtitle={`Signed in as a ${user.role}`} />
      <Card>
        <form onSubmit={handleSave} className="space-y-4">
          <Alert>{error}</Alert>
          <Alert type="success">{message}</Alert>
          <FormField label="Name" required value={form.name} onChange={update('name')} />
          <FormField label="Email" type="email" required value={form.email} onChange={update('email')} />
          <FormField label="Position" as="select" options={POSITION_OPTIONS} value={form.position} onChange={update('position')} />
          <FormField label="New password" type="password" placeholder="Leave blank to keep your current one" minLength={6} value={form.password} onChange={update('password')} />
          <Button type="submit">Save changes</Button>
        </form>
      </Card>

      <Card className="mt-8 border-red-200 dark:border-red-900/60">
        <h2 className="text-xl font-bold text-red-600">Delete account</h2>
        <p className="mt-1 text-sm text-gray-500">Deleting your account can't be undone.</p>
        <Button variant="danger" size="sm" className="mt-4" onClick={handleDelete}>Delete my account</Button>
      </Card>
    </div>
  )
}
