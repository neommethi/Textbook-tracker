import { useEffect, useState } from 'react'
import { apiFetch } from '../api'

export function useStudentTextbooks() {
  const [textbooks, setTextbooks] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadTextbooks() {
      setLoadState('loading')
      setLoadError('')

      try {
        const payload = await apiFetch('/api/learner/me/textbooks', {
          signal: controller.signal,
        })
        if (!Array.isArray(payload.textbooks)) {
          throw new Error('The server returned an unexpected textbook list.')
        }

        setTextbooks(payload.textbooks.map((book) => ({
          id: book.id,
          allocationNumber: book.allocation_number,
          title: book.title,
          subject: book.subject,
          grade: book.grade,
          dateAllocated: book.allocated_at,
          dateReturned: book.returned_at,
          status: book.returned_at ? 'returned' : 'issued',
        })))
        setLoadState('ready')
      } catch (error) {
        if (error.name === 'AbortError') return
        setLoadError(error.message || 'Could not reach the server. Please try again.')
        setLoadState('error')
      }
    }

    loadTextbooks()
    return () => controller.abort()
  }, [retryCount])

  return {
    textbooks,
    loadState,
    loadError,
    retry: () => setRetryCount((count) => count + 1),
  }
}
