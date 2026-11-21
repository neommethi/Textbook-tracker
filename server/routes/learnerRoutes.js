import express from 'express'
import { supabase } from '../supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.use((req, res, next) => {
  req.body ??= {}
  next()
})

router.use(requireAuth)

function fail(res, error) {
  console.error('Learner route error:', error)
  return res.status(500).json({ error: 'Internal server error' })
}

// List this learner's allocations and textbook details, optionally filtered by status.
router.get('/books', async (req, res) => {
  try {
    const { outstanding } = req.query
    let query = supabase
      .from('allocations')
      .select('id, status, issued_at, condition_issued, returned_at, condition_returned, fee_amount, fee_status, textbook:textbooks!allocations_textbook_id_fkey(book_number, title, subject, grade, condition)')
      .eq('learner_id', req.user.id)

    if (outstanding !== undefined) {
      if (outstanding === 'true') {
        query = query.is('returned_at', null)
      } else if (outstanding === 'false') {
        query = query.not('returned_at', 'is', null)
      } else {
        return res.status(400).json({ error: 'outstanding must be true or false.' })
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) return fail(res, error)
    return res.json({ books: data })
  } catch (error) {
    return fail(res, error)
  }
})

// Return this learner's total, outstanding, and returned allocation counts.
router.get('/summary', async (req, res) => {
  try {
    const [total, outstanding, returned] = await Promise.all([
      supabase
        .from('allocations')
        .select('id', { count: 'exact', head: true })
        .eq('learner_id', req.user.id),
      supabase
        .from('allocations')
        .select('id', { count: 'exact', head: true })
        .eq('learner_id', req.user.id)
        .is('returned_at', null),
      supabase
        .from('allocations')
        .select('id', { count: 'exact', head: true })
        .eq('learner_id', req.user.id)
        .not('returned_at', 'is', null),
    ])

    const error = total.error || outstanding.error || returned.error
    if (error) return fail(res, error)

    return res.json({
      total: total.count,
      outstanding: outstanding.count,
      returned: returned.count,
    })
  } catch (error) {
    return fail(res, error)
  }
})

export default router
