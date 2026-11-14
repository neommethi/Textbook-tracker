import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
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
    console.log('Signup submitted for', email)
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="text-sm text-gray-600 mt-1">
          We only ask for what we need to show you your textbooks.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input id="name" type="text" value={name}
              onChange={(e) => setName(e.target.value)} required className={inputClass} />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input id="password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <input id="confirm" type="password" value={confirm}
              onChange={(e) => setConfirm(e.target.value)} required className={inputClass} />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit"
            className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700">
            Sign up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}