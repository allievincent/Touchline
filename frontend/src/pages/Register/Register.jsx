import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Card from '../../components/Card.jsx'
import FormField from '../../components/FormField.jsx'
import Button from '../../components/Button.jsx'
import Alert from '../../components/Alert.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { POSITION_OPTIONS } from '../../utils/format.js'

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'player', position: 'Goalkeeper' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/sessions" replace />

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('Password needs to be at least 6 characters')
    setLoading(true)
    try {
      await register(form)
      navigate('/sessions')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-center text-5xl font-bold">Join Touchline</h1>
      <p className="mt-2 text-center text-gray-500">Takes about 20 seconds</p>
      <Card className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>{error}</Alert>
          <FormField label="Name" required value={form.name} onChange={update('name')} />
          <FormField label="Email" type="email" required value={form.email} onChange={update('email')} />
          <FormField label="Password" type="password" required value={form.password} onChange={update('password')} />

          <div>
            <span className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">I'm a...</span>
            <div className="grid grid-cols-2 gap-2">
              {['player', 'coach'].map((role) => (
                <button key={role} type="button" onClick={() => setForm({ ...form, role })}
                  className={`rounded-md border px-3 py-2 font-medium capitalize transition ${form.role === role
                    ? 'border-gray-900 bg-gray-900 text-white dark:border-volt dark:bg-volt dark:text-pitch-950'
                    : 'border-gray-300 hover:border-gray-500 dark:border-white/15'}`}>
                  {role}
                </button>
              ))}
            </div>
          </div>

          <FormField label="Position" as="select" options={POSITION_OPTIONS} value={form.position} onChange={update('position')} />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating account...' : 'Sign up'}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-gray-500">
          Already have one? <Link to="/login" className="font-medium text-pitch-700 hover:underline dark:text-volt">Log in</Link>
        </p>
      </Card>
    </div>
  )
}
