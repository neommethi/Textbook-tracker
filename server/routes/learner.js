import express from 'express'
import { supabase } from '../supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

function requireLearner(req, res, next) {
  if (req.user?.role !== 'user') {
    return res.status(403).json({ error: 'Learner access only.' })
  }
  next()
}

router.get('/me/textbooks', requireAuth, requireLearner, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('allocations')
      .select(`
        issued_at,
        condition_issued,
        status,
        returned_at,
        condition_returned,
        lost_at,
        fee_amount,
        fee_status,
        textbook:textbooks (
          book_number,
          title,
          subject,
          condition
        )
      `)
      .eq('learner_id', req.user.id)

    if (error) {
      console.error('Failed to retrieve learner textbook allocations:', error)
      return res.status(500).json({ error: 'Unable to retrieve textbook allocations.' })
    }

    const textbooks = data.map(allocation => ({
      book_number: allocation.textbook?.book_number ?? null,
      title: allocation.textbook?.title ?? null,
      subject: allocation.textbook?.subject ?? null,
      condition: allocation.textbook?.condition ?? null,
      condition_issued: allocation.condition_issued,
      condition_returned: allocation.condition_returned,
      issued_at: allocation.issued_at,
      returned_at: allocation.returned_at,
      status: allocation.status,
      lost_at: allocation.lost_at,
      fee_amount: allocation.fee_amount,
      fee_status: allocation.fee_status,
    }))

    return res.json({ textbooks })
  } catch (error) {
    console.error('Failed to retrieve learner textbook allocations:', error)
    return res.status(500).json({ error: 'Unable to retrieve textbook allocations.' })
  }
})

export default router
