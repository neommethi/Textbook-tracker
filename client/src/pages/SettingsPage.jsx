import { useEffect, useMemo, useState } from 'react'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import { apiFetch } from '../api'

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function AccountDetailsModal({ account, onClose, onSave }) {
  const [name, setName] = useState(account.name ?? '')
  const [email, setEmail] = useState(account.email ?? '')
  const [grade, setGrade] = useState(account.grade == null ? '' : String(account.grade))
  const [learnerClass, setLearnerClass] = useState(account.class ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const numericGrade = grade === '' ? null : Number(grade)

    if (!trimmedName) {
      setError('Enter the account name.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Enter a valid email address.')
      return
    }
    if (numericGrade !== null && (!Number.isInteger(numericGrade) || numericGrade < 8 || numericGrade > 12)) {
      setError('Grade must be between 8 and 12.')
      return
    }

    setError('')
    setSaving(true)
    try {
      await onSave({
        name: trimmedName,
        email: trimmedEmail,
        grade: numericGrade,
        class: learnerClass.trim() || null,
      })
    } catch (saveError) {
      setError(saveError.message || 'Could not save account details.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4">
      <section
        aria-labelledby="account-details-title"
        aria-modal="true"
        className="admin-blue-shadow my-auto w-full max-w-xl rounded-2xl border border-slate-700 bg-[#1a1d24] p-5 text-white sm:p-7"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              Account settings
            </p>
            <h2 id="account-details-title" className="mt-1 text-xl font-semibold">
              Configure details
            </h2>
            <p className="mt-1 text-sm text-slate-400">{account.email}</p>
          </div>
          <button
            aria-label="Close account details"
            className="min-h-10 rounded-lg border border-slate-700 px-3 text-sm text-slate-300 hover:bg-white/5"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="account-name">
              Name
            </label>
            <input
              autoComplete="name"
              className="min-h-11 w-full rounded-lg border border-slate-700 bg-[#111318] px-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              id="account-name"
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="account-email">
              Email
            </label>
            <input
              autoComplete="email"
              className="min-h-11 w-full rounded-lg border border-slate-700 bg-[#111318] px-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              id="account-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="account-grade">
                Grade
              </label>
              <select
                className="min-h-11 w-full rounded-lg border border-slate-700 bg-[#111318] px-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                id="account-grade"
                onChange={(event) => setGrade(event.target.value)}
                value={grade}
              >
                <option value="">Not set</option>
                {[8, 9, 10, 11, 12].map((gradeOption) => (
                  <option key={gradeOption} value={gradeOption}>
                    Grade {gradeOption}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300" htmlFor="account-class">
                Class
              </label>
              <input
                className="min-h-11 w-full rounded-lg border border-slate-700 bg-[#111318] px-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                id="account-class"
                onChange={(event) => setLearnerClass(event.target.value)}
                value={learnerClass}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-300" role="alert">{error}</p>}
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              className="min-h-11 rounded-lg border border-slate-700 px-4 font-medium text-slate-300 hover:bg-white/5"
              disabled={saving}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="min-h-11 rounded-lg bg-blue-600 px-4 font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
              type="submit"
            >
              {saving ? 'Saving...' : 'Save details'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function RoleChangeModal({ account, role, error, loading, onConfirm, onCancel }) {
  const makingAdmin = role === 'admin'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4">
      <section
        aria-labelledby="role-change-title"
        aria-modal="true"
        className="admin-blue-shadow w-full max-w-md rounded-2xl border border-slate-700 bg-[#1a1d24] p-6 text-white"
        role="alertdialog"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
          <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="3" />
            <path d="M5 20a7 7 0 0 1 14 0M19 8v6m-3-3h6" />
          </svg>
        </div>
        <h2 id="role-change-title" className="mt-4 text-xl font-semibold">
          {makingAdmin ? 'Make this account an admin?' : 'Remove admin access?'}
        </h2>
        <p className="mt-2 break-words text-sm leading-6 text-slate-400">
          {makingAdmin
            ? `${account.name} will be able to access the admin dashboard and manage school records.`
            : `${account.name} will lose admin access immediately and keep a standard account.`}
        </p>
        {error && <p className="mt-3 text-sm text-red-300" role="alert">{error}</p>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="min-h-11 rounded-lg border border-slate-700 px-4 font-medium text-slate-300 hover:bg-white/5"
            disabled={loading}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="min-h-11 rounded-lg bg-blue-600 px-4 font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={onConfirm}
            type="button"
          >
            {loading ? 'Updating...' : makingAdmin ? 'Make admin' : 'Remove admin'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default function SettingsPage() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [editingAccount, setEditingAccount] = useState(null)
  const [pendingRoleChange, setPendingRoleChange] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [operationError, setOperationError] = useState('')
  const [busyAccountId, setBusyAccountId] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const currentUserId = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')?.id
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    let active = true
    apiFetch('/api/admin/accounts')
      .then((result) => {
        if (!Array.isArray(result.accounts)) {
          throw new Error('The server returned an invalid accounts list.')
        }
        if (!active) return
        setAccounts(result.accounts)
        setLoadError('')
      })
      .catch((error) => {
        if (active) setLoadError(error.message || 'Could not load accounts.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [reloadCount])

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    if (!query) return accounts
    return accounts.filter((account) =>
      [account.name, account.email, account.role, account.class]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase().includes(query)),
    )
  }, [accounts, search])

  const adminCount = accounts.filter((account) => account.role === 'admin').length
  const learnerCount = accounts.filter((account) => account.role === 'user').length

  function reloadAccounts() {
    setLoadError('')
    setLoading(true)
    setReloadCount((count) => count + 1)
  }

  async function handleSaveAccount(values) {
    const result = await apiFetch(`/api/admin/accounts/${encodeURIComponent(editingAccount.id)}`, {
      method: 'PUT',
      body: values,
    })
    setAccounts((current) =>
      current.map((account) => account.id === result.account.id ? result.account : account),
    )

    if (result.account.id === currentUserId) {
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          name: result.account.name,
          email: result.account.email,
        }))
        window.dispatchEvent(new Event('admin-user-updated'))
      }
    }

    setEditingAccount(null)
    setSuccessMessage('Account details updated.')
  }

  async function handleRoleChange() {
    if (!pendingRoleChange) return
    setBusyAccountId(pendingRoleChange.account.id)
    setOperationError('')
    try {
      const result = await apiFetch(
        `/api/admin/accounts/${encodeURIComponent(pendingRoleChange.account.id)}/role`,
        {
          method: 'PATCH',
          body: { role: pendingRoleChange.role },
        },
      )
      setAccounts((current) =>
        current.map((account) => account.id === result.account.id ? result.account : account),
      )
      setSuccessMessage(
        pendingRoleChange.role === 'admin'
          ? `${result.account.name} is now an admin.`
          : `Admin access removed for ${result.account.name}.`,
      )
      setPendingRoleChange(null)
    } catch (error) {
      setOperationError(error.message || 'Could not update account access.')
    } finally {
      setBusyAccountId('')
    }
  }

  async function handleDeleteAccount() {
    if (!pendingDelete) return
    setBusyAccountId(pendingDelete.id)
    setOperationError('')
    try {
      await apiFetch(`/api/admin/accounts/${encodeURIComponent(pendingDelete.id)}`, {
        method: 'DELETE',
      })
      setAccounts((current) => current.filter((account) => account.id !== pendingDelete.id))
      setSuccessMessage(`${pendingDelete.name}'s account was deleted.`)
      setPendingDelete(null)
    } catch (error) {
      setOperationError(error.message || 'Could not delete the account.')
    } finally {
      setBusyAccountId('')
    }
  }

  function openRoleChange(account) {
    setSuccessMessage('')
    setOperationError('')
    setPendingRoleChange({
      account,
      role: account.role === 'admin' ? 'user' : 'admin',
    })
  }

  return (
    <div className="min-h-screen px-4 py-7 text-white sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Settings</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Manage registered accounts, profile details, and administrator access.
            </p>
          </div>
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Search accounts</span>
            <svg aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              className="min-h-11 w-full rounded-xl border border-slate-700 bg-[#1a1d24] pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email or role..."
              type="search"
              value={search}
            />
          </label>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Registered accounts', value: accounts.length, caption: 'All accounts' },
            { label: 'Administrators', value: adminCount, caption: 'Management access' },
            { label: 'Standard accounts', value: learnerCount, caption: 'Learner access' },
          ].map((stat) => (
            <article
              key={stat.label}
              className="admin-blue-shadow rounded-xl border border-slate-800 bg-[#1a1d24] p-4 sm:p-5"
            >
              <p className="text-sm text-slate-400">{stat.label}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <span className="text-3xl font-bold tracking-tight text-blue-300">{stat.value}</span>
                <span className="pb-1 text-xs text-slate-500">{stat.caption}</span>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-8" aria-labelledby="accounts-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="accounts-heading" className="text-lg font-semibold text-white">Accounts</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredAccounts.length} {filteredAccounts.length === 1 ? 'account' : 'accounts'}
                {search.trim() ? ' found' : ' registered'}
              </p>
            </div>
            {!loading && (
              <button
                className="text-sm font-medium text-blue-300 hover:text-blue-200"
                onClick={reloadAccounts}
                type="button"
              >
                Refresh list
              </button>
            )}
          </div>

          {successMessage && (
            <p className="mb-4 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200" role="status">
              {successMessage}
            </p>
          )}
          {loadError ? (
            <div className="rounded-xl border border-red-400/30 bg-[#1a1d24] p-6" role="alert">
              <p className="text-sm text-red-200">{loadError}</p>
              <button
                className="mt-3 min-h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500"
                onClick={reloadAccounts}
                type="button"
              >
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="rounded-xl border border-slate-800 bg-[#1a1d24] p-6 text-sm text-slate-400" role="status">
              Loading accounts...
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-[#1a1d24] p-10 text-center">
              <p className="font-medium text-slate-200">No accounts found</p>
              <p className="mt-1 text-sm text-slate-500">Try another search term.</p>
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {filteredAccounts.map((account) => {
                const isSelf = account.id === currentUserId
                const isAdmin = account.role === 'admin'
                return (
                  <article
                    key={account.id}
                    className="admin-blue-shadow rounded-xl border border-slate-800 bg-[#1a1d24] p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-sm font-bold uppercase text-blue-300">
                          {account.name.trim().slice(0, 1) || '?'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-white">
                            {account.name}
                            {isSelf && <span className="ml-2 text-xs font-medium text-blue-300">You</span>}
                          </h3>
                          <p className="truncate text-sm text-slate-400">{account.email}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isAdmin
                          ? 'bg-blue-400/10 text-blue-300'
                          : 'bg-slate-700/60 text-slate-300'
                      }`}>
                        {isAdmin ? 'Admin' : 'Standard'}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Grade / class</p>
                        <p className="mt-1 text-slate-200">
                          {account.grade == null ? '—' : `Grade ${account.grade}`}
                          {account.class ? ` · ${account.class}` : ''}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Registered</p>
                        <p className="mt-1 text-slate-200">{formatDate(account.created_at)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
                      <button
                        className="min-h-10 rounded-lg border border-slate-700 px-3 text-sm font-medium text-slate-200 transition-colors hover:border-blue-500/40 hover:bg-blue-400/5 hover:text-blue-200"
                        onClick={() => {
                          setSuccessMessage('')
                          setEditingAccount(account)
                        }}
                        type="button"
                      >
                        Configure details
                      </button>
                      <button
                        className="min-h-10 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isSelf || Boolean(busyAccountId)}
                        onClick={() => openRoleChange(account)}
                        title={isSelf ? 'You cannot change your own admin access' : undefined}
                        type="button"
                      >
                        {isAdmin ? 'Remove admin' : 'Make admin'}
                      </button>
                      <button
                        className="ml-auto min-h-10 rounded-lg border border-red-400/30 px-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isSelf || Boolean(busyAccountId)}
                        onClick={() => {
                          setOperationError('')
                          setPendingDelete(account)
                        }}
                        title={isSelf ? 'You cannot delete your own account' : undefined}
                        type="button"
                      >
                        Delete account
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {editingAccount && (
        <AccountDetailsModal
          account={editingAccount}
          onClose={() => setEditingAccount(null)}
          onSave={handleSaveAccount}
        />
      )}
      {pendingRoleChange && (
        <RoleChangeModal
          account={pendingRoleChange.account}
          role={pendingRoleChange.role}
          error={operationError}
          loading={busyAccountId === pendingRoleChange.account.id}
          onConfirm={handleRoleChange}
          onCancel={() => {
            setPendingRoleChange(null)
            setOperationError('')
          }}
        />
      )}
      {pendingDelete && (
        <ConfirmDeleteModal
          itemType="account"
          itemDescription={`${pendingDelete.name} (${pendingDelete.email})`}
          error={operationError}
          loading={busyAccountId === pendingDelete.id}
          onConfirm={handleDeleteAccount}
          onCancel={() => {
            setPendingDelete(null)
            setOperationError('')
          }}
        />
      )}
    </div>
  )
}
