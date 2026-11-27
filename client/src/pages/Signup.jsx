import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiUrl } from '../api'

export default function Signup() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [grade, setGrade] = useState('')
  const [classGroup, setClassGroup] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')

    try {
      const res = await fetch(apiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, grade, class: classGroup }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        return
      }
      navigate('/login')
    } catch {
      setError('Could not reach the server. Please try again.')
    }
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelClass = 'block text-sm font-medium text-slate-700'

  return (
    <div className="auth-page min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="text-sm text-slate-600 mt-1">
          We only ask for what we need to show you your textbooks.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className={labelClass}>Full name and surname</label>
            <input id="name" type="text" value={name}
              onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          </div>

          <div>
            <label htmlFor="grade" className={labelClass}>Grade</label>
            <select id="grade" value={grade}
              onChange={(e) => setGrade(e.target.value)} required className={inputClass}>
              <option value="">Select your grade</option>
              {[8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="class" className={labelClass}>Class (optional)</label>
            <input id="class" type="text" value={classGroup} placeholder="e.g. 10A"
              onChange={(e) => setClassGroup(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <input id="password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
          </div>

          <div>
            <label htmlFor="confirm" className={labelClass}>Confirm password</label>
            <input id="confirm" type="password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} required className={inputClass} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit"
            className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700">
            Sign up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  )
}