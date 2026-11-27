import { useEffect, useState } from 'react'
import { apiFetch } from '../api'
import FullScreenLoading from '../components/FullScreenLoading'

const grades = [8, 9, 10, 11, 12]

const inputClass =
  'min-h-11 w-full rounded-lg border border-slate-700 bg-[#111318] px-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'

export default function StudentSettingsPage() {
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')
  const [learnerClass, setLearnerClass] = useState('')
  const [loadState, setLoadState] = useState('loading')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    apiFetch('/api/learner/me')
      .then((payload) => {
        if (!active) return
        if (!payload?.user) throw new Error('The server returned an invalid profile.')
        const { user } = payload
        setProfile(user)
        setName(user.name ?? '')
        setGrade(user.grade == null ? '' : String(user.grade))
        setLearnerClass(user.class ?? '')
        setLoadState('ready')
      })
      .catch((loadError) => {
        if (!active) return
        setError(loadError.message || 'Unable to load your profile.')
        setLoadState('error')
      })

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanName = name.trim()
    const numericGrade = Number(grade)
    if (!cleanName) {
      setError('Enter your name.')
      return
    }
    if (!Number.isInteger(numericGrade) || numericGrade < 8 || numericGrade > 12) {
      setError('Choose a grade from 8 to 12.')
      return
    }

    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const { user } = await apiFetch('/api/learner/me', {
        method: 'PUT',
        body: {
          name: cleanName,
          grade: numericGrade,
          class: learnerClass.trim() || null,
        },
      })
      setProfile(user)
      setName(user.name)
      setGrade(String(user.grade))
      setLearnerClass(user.class ?? '')

      let storedUser = {}
      try {
        storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      } catch {
        localStorage.removeItem('user')
      }
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...user }))
      window.dispatchEvent(new Event('student-user-updated'))
      setSuccess('Your profile has been updated.')
    } catch (saveError) {
      setError(saveError.message || 'Unable to update your profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <FullScreenLoading visible={loadState === 'loading'} label="Loading your settings..." />
      {loadState !== 'loading' && (
        <section className="flex min-h-[calc(100vh-3.5rem)] flex-col px-4 py-6 text-white sm:px-6 sm:py-8 md:min-h-screen lg:px-8">
          <div className="flex w-full flex-1 flex-col">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                Student account
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Settings</h1>
              <p className="mt-2 text-sm text-slate-400">
                Update your name, grade, or class details.
              </p>
            </div>

            {loadState === 'error' ? (
              <div role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-5 text-sm text-red-300">
                {error}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="admin-blue-shadow flex w-full flex-1 flex-col rounded-xl border border-slate-800 bg-[#1a1d24] p-5 sm:p-7"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="student-name" className="mb-1.5 block text-sm font-medium text-slate-300">
                      Name
                    </label>
                    <input
                      id="student-name"
                      autoComplete="name"
                      className={inputClass}
                      onChange={(event) => setName(event.target.value)}
                      required
                      value={name}
                    />
                  </div>

                  <div>
                    <label htmlFor="student-grade" className="mb-1.5 block text-sm font-medium text-slate-300">
                      Grade
                    </label>
                    <select
                      id="student-grade"
                      className={inputClass}
                      onChange={(event) => setGrade(event.target.value)}
                      required
                      value={grade}
                    >
                      <option value="" disabled>Select grade</option>
                      {grades.map((gradeOption) => (
                        <option key={gradeOption} value={gradeOption}>Grade {gradeOption}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="student-class" className="mb-1.5 block text-sm font-medium text-slate-300">
                      Class
                    </label>
                    <input
                      id="student-class"
                      className={inputClass}
                      onChange={(event) => setLearnerClass(event.target.value)}
                      placeholder="Optional"
                      value={learnerClass}
                    />
                  </div>
                </div>

                {profile?.email && (
                  <p className="mt-5 border-t border-slate-800 pt-4 text-sm text-slate-400">
                    Account email <span className="ml-1 font-medium text-slate-300">{profile.email}</span>
                    <span className="ml-2 text-xs">Email isn’t editable here.</span>
                  </p>
                )}

                {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
                {success && <p role="status" className="mt-4 text-sm text-emerald-300">{success}</p>}

                <div className="mt-auto flex justify-end border-t border-slate-800 pt-5">
                  <button
                    type="submit"
                    disabled={saving}
                    className="min-h-11 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      )}
    </>
  )
}
