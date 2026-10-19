import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Card from '../../components/Card.jsx'
import FormField from '../../components/FormField.jsx'
import Button from '../../components/Button.jsx'
import Alert from '../../components/Alert.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // send them back to the page they were trying to get to
  const goTo = location.state?.from || '/sessions'
  if (user) return <Navigate to={goTo} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(goTo, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (email) => setForm({ email, password: 'password123' })

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-center text-5xl font-bold">Welcome back</h1>
      <p className="mt-2 text-center text-gray-500">Log in to book sessions</p>
      <Card className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>{error}</Alert>
          <FormField label="Email" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <FormField label="Password" type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</Button>
        </form>
        <p className="mt-5 text-center text-sm text-gray-500">
          No account? <Link to="/register" className="font-medium text-pitch-700 hover:underline dark:text-volt">Sign up</Link>
        </p>
      </Card>

      {/* demo accounts from the seed data so people can try it quickly */}
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-4 text-sm dark:border-white/15">
        <p className="font-medium">Just looking? Try a demo account:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => fillDemo('player@touchline.app')}>Player demo</Button>
          <Button size="sm" variant="secondary" onClick={() => fillDemo('coach@touchline.app')}>Coach demo</Button>
        </div>
      </div>
    </div>
  )
}
